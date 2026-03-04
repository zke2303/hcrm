package repository

import (
	"context"

	"hcrm/backend/internal/model"

	"gorm.io/gorm"
)

// TitleRepository 职称仓储接口
type TitleRepository interface {
	FindAll(ctx context.Context) ([]*model.Title, error)
}

type titleRepository struct {
	gormDB *gorm.DB
}

// NewTitleRepository 创建职称仓储
func NewTitleRepository(db *gorm.DB) TitleRepository {
	return &titleRepository{gormDB: db}
}

func (r *titleRepository) FindAll(ctx context.Context) ([]*model.Title, error) {
	var titles []*model.Title
	err := r.gormDB.WithContext(ctx).Where("status = ?", 1).Order("sort_order asc, id asc").Find(&titles).Error
	if err != nil {
		return nil, err
	}
	return titles, nil
}
