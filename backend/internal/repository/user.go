package repository

import (
	"context"

	"hcrm/backend/internal/model"

	"gorm.io/gorm"
)

// UserRepository 用户仓储接口
type UserRepository interface {
	GetByUsername(ctx context.Context, username string) (*model.User, error)
	GetRolesAndPermissions(ctx context.Context, userID uint) ([]string, []string, error)
	GetDoctorByUserID(ctx context.Context, userID uint) (*model.Doctor, error)
	UpdateLastLogin(ctx context.Context, userID uint, ip string) error
}

type userRepository struct {
	db *gorm.DB
}

// NewUserRepository 创建用户仓储
func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	var user model.User
	err := r.db.WithContext(ctx).Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) GetRolesAndPermissions(ctx context.Context, userID uint) ([]string, []string, error) {
	var roles []string
	var permissions []string

	// 查询角色
	err := r.db.WithContext(ctx).Table("roles").
		Joins("JOIN user_roles ON roles.id = user_roles.role_id").
		Where("user_roles.user_id = ?", userID).
		Pluck("roles.name", &roles).Error
	if err != nil {
		return nil, nil, err
	}

	// 查询权限码
	err = r.db.WithContext(ctx).Table("permissions").
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
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&doctor).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &doctor, nil
}

func (r *userRepository) UpdateLastLogin(ctx context.Context, userID uint, ip string) error {
	now := r.db.NowFunc()
	return r.db.WithContext(ctx).Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"last_login_at": &now,
		"last_login_ip": ip,
	}).Error
}
