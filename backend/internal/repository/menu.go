package repository

import (
	"context"

	"hcrm/backend/internal/model"

	"gorm.io/gorm"
)

type MenuRepository interface {
	Create(ctx context.Context, menu *model.Menu) error
	Update(ctx context.Context, menu *model.Menu) error
	Delete(ctx context.Context, id uint) error
	GetByID(ctx context.Context, id uint) (*model.Menu, error)
	List(ctx context.Context, name string, status *int8) ([]*model.Menu, error)
	GetChildrenCount(ctx context.Context, parentID uint) (int64, error)
}

type menuRepository struct {
	dbConn *gorm.DB
}

func NewMenuRepository(db *gorm.DB) MenuRepository {
	return &menuRepository{dbConn: db}
}

func (r *menuRepository) db(ctx context.Context) *gorm.DB {
	return r.dbConn.WithContext(ctx)
}

func (r *menuRepository) Create(ctx context.Context, menu *model.Menu) error {
	return r.db(ctx).Create(menu).Error
}

func (r *menuRepository) Update(ctx context.Context, menu *model.Menu) error {
	return r.db(ctx).Save(menu).Error
}

func (r *menuRepository) Delete(ctx context.Context, id uint) error {
	return r.db(ctx).Delete(&model.Menu{}, id).Error
}

func (r *menuRepository) GetByID(ctx context.Context, id uint) (*model.Menu, error) {
	var menu model.Menu
	err := r.db(ctx).First(&menu, id).Error
	return &menu, err
}

func (r *menuRepository) List(ctx context.Context, name string, status *int8) ([]*model.Menu, error) {
	var menus []*model.Menu
	db := r.db(ctx).Model(&model.Menu{}).Order("sort_order asc, id asc")

	if name != "" {
		db = db.Where("name LIKE ?", "%"+name+"%")
	}
	if status != nil {
		db = db.Where("status = ?", *status)
	}

	err := db.Find(&menus).Error
	return menus, err
}

func (r *menuRepository) GetChildrenCount(ctx context.Context, parentID uint) (int64, error) {
	var count int64
	err := r.db(ctx).Model(&model.Menu{}).Where("parent_id = ?", parentID).Count(&count).Error
	return count, err
}
