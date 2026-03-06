package repository

import (
	"context"

	"hcrm/backend/internal/model"
	"hcrm/backend/internal/pkg/database"
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
	UpdateMap(ctx context.Context, id uint, data map[string]interface{}) error
	Delete(ctx context.Context, id uint) error
	UpdateStatus(ctx context.Context, id uint, status int8) error
	ResetPassword(ctx context.Context, id uint, passwordHash string) error
	UpdateRoles(ctx context.Context, userID uint, roleIDs []uint) error
	GetRoles(ctx context.Context, userID uint) ([]model.Role, error)
	ListRolesByUserIDs(ctx context.Context, userIDs []uint) (map[uint][]model.Role, error)
	GetRolesAndPermissions(ctx context.Context, userID uint) ([]string, []string, error)
	GetMenusByUserID(ctx context.Context, userID uint) ([]*model.Menu, error)
	GetDoctorByUserID(ctx context.Context, userID uint) (*model.Doctor, error)
	UpdateLastLogin(ctx context.Context, userID uint, ip string) error
	FindAllRoles(ctx context.Context) ([]model.Role, error)
	GetMaxEmployeeNo(ctx context.Context) (string, error)
	ChangePassword(ctx context.Context, userID uint, passwordHash string) error
	ClearMustChangePassword(ctx context.Context, userID uint) error
	GetDataScope(ctx context.Context, userID uint) (int, []uint, error)
}

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
	query := r.db(ctx).Model(&model.User{}).Scopes(database.DataScope(ctx, "users.creator_id", "users.department_id"))

	if req.Keyword != "" {
		k := "%" + req.Keyword + "%"
		query = query.Where(
			r.db(ctx).Where("username LIKE ?", k).
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
	if req.RoleID != nil {
		query = query.Joins("JOIN user_roles ON users.id = user_roles.user_id").
			Where("user_roles.role_id = ?", *req.RoleID)
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

func (r *userRepository) UpdateMap(ctx context.Context, id uint, data map[string]interface{}) error {
	return r.db(ctx).Model(&model.User{}).Where("id = ?", id).Updates(data).Error
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

func (r *userRepository) ListRolesByUserIDs(ctx context.Context, userIDs []uint) (map[uint][]model.Role, error) {
	if len(userIDs) == 0 {
		return make(map[uint][]model.Role), nil
	}

	var results []struct {
		UserID uint
		model.Role
	}
	err := r.db(ctx).Table("roles").
		Select("user_roles.user_id, roles.*").
		Joins("JOIN user_roles ON roles.id = user_roles.role_id").
		Where("user_roles.user_id IN ?", userIDs).
		Find(&results).Error
	if err != nil {
		return nil, err
	}

	res := make(map[uint][]model.Role)
	for _, item := range results {
		res[item.UserID] = append(res[item.UserID], item.Role)
	}
	return res, nil
}

func (r *userRepository) GetRolesAndPermissions(ctx context.Context, userID uint) ([]string, []string, error) {
	var roles []string
	var perms []string

	// 查询角色编码
	err := r.db(ctx).Table("roles").
		Joins("JOIN user_roles ON roles.id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Where("roles.status = ?", 1).
		Pluck("roles.code", &roles).Error
	if err != nil {
		return nil, nil, err
	}

	// 查权限码 (从 sys_menus 获取)
	err = r.db(ctx).Table("sys_menus").
		Joins("JOIN sys_role_menus ON sys_menus.id = sys_role_menus.menu_id").
		Joins("JOIN user_roles ON sys_role_menus.role_id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Where("sys_menus.status = ?", 1).
		Where("sys_menus.perms IS NOT NULL AND sys_menus.perms != ''").
		Distinct("sys_menus.perms").
		Pluck("sys_menus.perms", &perms).Error

	return roles, perms, err
}

func (r *userRepository) GetMenusByUserID(ctx context.Context, userID uint) ([]*model.Menu, error) {
	var menus []*model.Menu
	err := r.db(ctx).Table("sys_menus").
		Joins("JOIN sys_role_menus ON sys_menus.id = sys_role_menus.menu_id").
		Joins("JOIN user_roles ON sys_role_menus.role_id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Where("sys_menus.status = ?", 1).
		Where("sys_menus.type IN ?", []int{1, 2}).
		Order("sys_menus.sort_order asc").
		Select("DISTINCT sys_menus.*").
		Find(&menus).Error
	return menus, err
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

func (r *userRepository) GetDataScope(ctx context.Context, userID uint) (int, []uint, error) {
	var roles []model.Role
	err := r.db(ctx).Table("roles").
		Joins("JOIN user_roles ON roles.id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Where("roles.status = ?", 1).
		Find(&roles).Error
	if err != nil {
		return 4, nil, err
	}

	if len(roles) == 0 {
		return 4, nil, nil // Default to SELF
	}

	// 1-全部, 2-本机构, 3-本科室, 4-本人
	maxScope := 4
	for _, role := range roles {
		if role.DataScope < maxScope {
			maxScope = role.DataScope
		}
	}

	// 如果涉及跨部门自定义权限（虽然当前模型中 2,3,4 未明确包含自定义，但预留 sys_role_depts 逻辑）
	var deptIDs []uint
	r.db(ctx).Model(&model.RoleDept{}).
		Joins("JOIN user_roles ON sys_role_depts.role_id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Pluck("department_id", &deptIDs)

	return maxScope, deptIDs, nil
}
