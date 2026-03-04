package repository

import (
	"context"

	"hcrm/backend/internal/model"
	"hcrm/backend/internal/schema/dto"

	"gorm.io/gorm"
)

// UserRepository 用户仓储接口
type UserRepository interface {
	Transaction(ctx context.Context, fn func(txCtx context.Context) error) error
	GetByID(ctx context.Context, id uint) (*model.User, error)
	GetByUsername(ctx context.Context, username string) (*model.User, error)
	GetByPhone(ctx context.Context, phone string) (*model.User, error)
	List(ctx context.Context, req *dto.ListUserRequest) ([]*model.User, int64, error)
	Create(ctx context.Context, user *model.User) error
	Update(ctx context.Context, user *model.User) error
	Delete(ctx context.Context, id uint) error
	UpdateStatus(ctx context.Context, id uint, status int8) error
	ResetPassword(ctx context.Context, id uint, passwordHash string) error
	UpdateRoles(ctx context.Context, userID uint, roleIDs []uint) error
	GetRoles(ctx context.Context, userID uint) ([]model.Role, error)
	GetRolesAndPermissions(ctx context.Context, userID uint) ([]string, []string, error)
	GetDoctorByUserID(ctx context.Context, userID uint) (*model.Doctor, error)
	UpdateLastLogin(ctx context.Context, userID uint, ip string) error
	FindAllRoles(ctx context.Context) ([]model.Role, error)
	GetMaxEmployeeNo(ctx context.Context) (string, error)
	ChangePassword(ctx context.Context, userID uint, passwordHash string) error
	ClearMustChangePassword(ctx context.Context, userID uint) error
}

type txKey struct{}

type userRepository struct {
	gormDB *gorm.DB
}

// NewUserRepository 创建用户仓储
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{gormDB: db}
}

func (r *userRepository) db(ctx context.Context) *gorm.DB {
	tx, ok := ctx.Value(txKey{}).(*gorm.DB)
	if ok {
		return tx
	}
	return r.gormDB.WithContext(ctx)
}

func (r *userRepository) Transaction(ctx context.Context, fn func(txCtx context.Context) error) error {
	return r.gormDB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(context.WithValue(ctx, txKey{}, tx))
	})
}

func (r *userRepository) GetByID(ctx context.Context, id uint) (*model.User, error) {
	var user model.User
	err := r.db(ctx).First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := r.db(ctx).Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetByPhone(ctx context.Context, phone string) (*model.User, error) {
	var user model.User
	err := r.db(ctx).Where("phone = ?", phone).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) List(ctx context.Context, req *dto.ListUserRequest) ([]*model.User, int64, error) {
	var users []*model.User
	var total int64
	query := r.db(ctx).Model(&model.User{})

	if req.Keyword != "" {
		k := "%" + req.Keyword + "%"
		query = query.Where(
			r.gormDB.Where("username LIKE ?", k).
				Or("real_name LIKE ?", k).
				Or("phone LIKE ?", k).
				Or("employee_no LIKE ?", k).
				Or("remark LIKE ?", k),
		)
	}
	if req.Username != "" {
		query = query.Where("username LIKE ?", "%"+req.Username+"%")
	}
	if req.RealName != "" {
		query = query.Where("real_name LIKE ?", "%"+req.RealName+"%")
	}
	if req.Phone != "" {
		query = query.Where("phone LIKE ?", "%"+req.Phone+"%")
	}
	if req.DepartmentID != nil {
		query = query.Where("department_id = ?", *req.DepartmentID)
	}
	if req.Status != nil {
		query = query.Where("users.status = ?", *req.Status)
	}
	if req.Title != "" {
		query = query.Joins("JOIN doctors ON users.id = doctors.user_id").
			Where("doctors.title = ?", req.Title)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (req.Page - 1) * req.PageSize
	err = query.Offset(offset).Limit(req.PageSize).Order("users.id DESC").Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *userRepository) Create(ctx context.Context, user *model.User) error {
	return r.db(ctx).Create(user).Error
}

func (r *userRepository) Update(ctx context.Context, user *model.User) error {
	return r.db(ctx).Save(user).Error
}

func (r *userRepository) Delete(ctx context.Context, id uint) error {
	return r.db(ctx).Delete(&model.User{}, id).Error
}

func (r *userRepository) UpdateStatus(ctx context.Context, id uint, status int8) error {
	return r.db(ctx).Model(&model.User{}).Where("id = ?", id).Update("status", status).Error
}

func (r *userRepository) ResetPassword(ctx context.Context, id uint, passwordHash string) error {
	return r.db(ctx).Model(&model.User{}).Where("id = ?", id).Update("password_hash", passwordHash).Error
}

func (r *userRepository) UpdateRoles(ctx context.Context, userID uint, roleIDs []uint) error {
	// 简单的多对多更新：先删除旧的，再插入新的
	err := r.db(ctx).Where("user_id = ?", userID).Delete(&model.UserRole{}).Error
	if err != nil {
		return err
	}

	if len(roleIDs) == 0 {
		return nil
	}

	var userRoles []model.UserRole
	for _, roleID := range roleIDs {
		userRoles = append(userRoles, model.UserRole{
			UserID: userID,
			RoleID: roleID,
		})
	}
	return r.db(ctx).Create(&userRoles).Error
}

func (r *userRepository) GetRoles(ctx context.Context, userID uint) ([]model.Role, error) {
	var roles []model.Role
	err := r.db(ctx).Table("roles").
		Joins("JOIN user_roles ON roles.id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Find(&roles).Error
	return roles, err
}

func (r *userRepository) GetRolesAndPermissions(ctx context.Context, userID uint) ([]string, []string, error) {
	var roles []string
	var permissions []string

	// 查询角色
	err := r.db(ctx).Table("roles").
		Joins("JOIN user_roles ON roles.id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Pluck("roles.name", &roles).Error
	if err != nil {
		return nil, nil, err
	}

	// 查询权限码
	err = r.db(ctx).Table("permissions").
		Joins("JOIN role_permissions ON permissions.id = role_permissions.permission_id").
		Joins("JOIN user_roles ON role_permissions.role_id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Where("permissions.status = ?", 1).
		Distinct("permissions.code").
		Pluck("permissions.code", &permissions).Error
	if err != nil {
		return nil, nil, err
	}

	return roles, permissions, nil
}

func (r *userRepository) GetDoctorByUserID(ctx context.Context, userID uint) (*model.Doctor, error) {
	var doctor model.Doctor
	err := r.db(ctx).Where("user_id = ?", userID).First(&doctor).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &doctor, nil
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, userID uint, ip string) error {
	now := r.gormDB.NowFunc()
	return r.db(ctx).Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"last_login_at": &now,
		"last_login_ip": ip,
	}).Error
}

func (r *userRepository) FindAllRoles(ctx context.Context) ([]model.Role, error) {
	var roles []model.Role
	err := r.db(ctx).Order("id ASC").Find(&roles).Error
	return roles, err
}

// GetMaxEmployeeNo
// Returns empty string if no employee exists
func (r *userRepository) GetMaxEmployeeNo(ctx context.Context) (string, error) {
	var employeeNo string
	err := r.db(ctx).Model(&model.User{}).
		Where("employee_no LIKE ?", "EMP%").
		Order("employee_no DESC").
		Limit(1).
		Pluck("employee_no", &employeeNo).Error
	if err == gorm.ErrRecordNotFound {
		return "", nil
	}
	return employeeNo, err
}

// ChangePassword updates user password and clears must_change_password flag
func (r *userRepository) ChangePassword(ctx context.Context, userID uint, passwordHash string) error {
	return r.db(ctx).Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"password_hash":        passwordHash,
		"must_change_password": false,
	}).Error
}

// ClearMustChangePassword clears the must_change_password flag for a user
func (r *userRepository) ClearMustChangePassword(ctx context.Context, userID uint) error {
	return r.db(ctx).Model(&model.User{}).Where("id = ?", userID).Update("must_change_password", false).Error
}
