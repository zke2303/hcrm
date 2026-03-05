package repository

import (
	"context"

	"hcrm/backend/internal/model"

	"gorm.io/gorm"
)

type RoleRepository interface {
	Transaction(ctx context.Context, fn func(txCtx context.Context) error) error
	Create(ctx context.Context, role *model.Role) error
	Update(ctx context.Context, role *model.Role) error
	Delete(ctx context.Context, id uint) error
	GetByID(ctx context.Context, id uint) (*model.Role, error)
	GetByCode(ctx context.Context, code string) (*model.Role, error)
	List(ctx context.Context, name string, status *int8) ([]*model.Role, int64, error)
	UpdateStatus(ctx context.Context, id uint, status int8) error

	// 关联权限
	GetMenuIDsByRoleID(ctx context.Context, roleID uint) ([]uint, error)
	UpdateMenus(ctx context.Context, roleID uint, menuIDs []uint) error

	// 数据权限
	GetDeptIDsByRoleID(ctx context.Context, roleID uint) ([]uint, error)
	UpdateDepts(ctx context.Context, roleID uint, deptIDs []uint) error
}

type roleRepository struct {
	dbConn *gorm.DB
}

func NewRoleRepository(db *gorm.DB) RoleRepository {
	return &roleRepository{dbConn: db}
}

func (r *roleRepository) db(ctx context.Context) *gorm.DB {
	tx, ok := ctx.Value("tx").(*gorm.DB)
	if ok {
		return tx
	}
	return r.dbConn.WithContext(ctx)
}

func (r *roleRepository) Transaction(ctx context.Context, fn func(txCtx context.Context) error) error {
	return r.dbConn.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txCtx := context.WithValue(ctx, "tx", tx)
		return fn(txCtx)
	})
}

func (r *roleRepository) Create(ctx context.Context, role *model.Role) error {
	return r.db(ctx).Create(role).Error
}

func (r *roleRepository) Update(ctx context.Context, role *model.Role) error {
	return r.db(ctx).Save(role).Error
}

func (r *roleRepository) Delete(ctx context.Context, id uint) error {
	return r.db(ctx).Delete(&model.Role{}, id).Error
}

func (r *roleRepository) GetByID(ctx context.Context, id uint) (*model.Role, error) {
	var role model.Role
	err := r.db(ctx).First(&role, id).Error
	return &role, err
}

func (r *roleRepository) GetByCode(ctx context.Context, code string) (*model.Role, error) {
	var role model.Role
	err := r.db(ctx).Where("code = ?", code).First(&role).Error
	return &role, err
}

func (r *roleRepository) List(ctx context.Context, name string, status *int8) ([]*model.Role, int64, error) {
	var roles []*model.Role
	var total int64
	db := r.db(ctx).Model(&model.Role{})

	if name != "" {
		db = db.Where("name LIKE ?", "%"+name+"%")
	}
	if status != nil {
		db = db.Where("status = ?", *status)
	}

	err := db.Count(&total).Find(&roles).Error
	return roles, total, err
}

func (r *roleRepository) UpdateStatus(ctx context.Context, id uint, status int8) error {
	return r.db(ctx).Model(&model.Role{}).Where("id = ?", id).Update("status", status).Error
}

func (r *roleRepository) GetMenuIDsByRoleID(ctx context.Context, roleID uint) ([]uint, error) {
	var menuIDs []uint
	err := r.db(ctx).Model(&model.RoleMenu{}).Where("role_id = ?", roleID).Pluck("menu_id", &menuIDs).Error
	return menuIDs, err
}

func (r *roleRepository) UpdateMenus(ctx context.Context, roleID uint, menuIDs []uint) error {
	return r.Transaction(ctx, func(txCtx context.Context) error {
		if err := r.db(txCtx).Where("role_id = ?", roleID).Delete(&model.RoleMenu{}).Error; err != nil {
			return err
		}
		if len(menuIDs) > 0 {
			roleMenus := make([]model.RoleMenu, len(menuIDs))
			for i, menuID := range menuIDs {
				roleMenus[i] = model.RoleMenu{RoleID: roleID, MenuID: menuID}
			}
			return r.db(txCtx).Create(&roleMenus).Error
		}
		return nil
	})
}

func (r *roleRepository) GetDeptIDsByRoleID(ctx context.Context, roleID uint) ([]uint, error) {
	var deptIDs []uint
	err := r.db(ctx).Model(&model.RoleDept{}).Where("role_id = ?", roleID).Pluck("department_id", &deptIDs).Error
	return deptIDs, err
}

func (r *roleRepository) UpdateDepts(ctx context.Context, roleID uint, deptIDs []uint) error {
	return r.Transaction(ctx, func(txCtx context.Context) error {
		if err := r.db(txCtx).Where("role_id = ?", roleID).Delete(&model.RoleDept{}).Error; err != nil {
			return err
		}
		if len(deptIDs) > 0 {
			roleDepts := make([]model.RoleDept, len(deptIDs))
			for i, deptID := range deptIDs {
				roleDepts[i] = model.RoleDept{RoleID: roleID, DepartmentID: deptID}
			}
			return r.db(txCtx).Create(&roleDepts).Error
		}
		return nil
	})
}
