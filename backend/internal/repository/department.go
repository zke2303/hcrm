package repository

import (
	"context"

	"hcrm/backend/internal/model"

	"gorm.io/gorm"
)

// DepartmentRepository 科室仓储接口
type DepartmentRepository interface {
	GetByID(ctx context.Context, id uint) (*model.Department, error)
	ListByIDs(ctx context.Context, ids []uint) (map[uint]*model.Department, error)
	FindAll(ctx context.Context) ([]*model.Department, error)
}

type departmentRepository struct {
	gormDB *gorm.DB
}

// NewDepartmentRepository 创建科室仓储
func NewDepartmentRepository(db *gorm.DB) DepartmentRepository {
	return &departmentRepository{gormDB: db}
}

func (r *departmentRepository) db(ctx context.Context) *gorm.DB {
	tx, ok := ctx.Value(txKey{}).(*gorm.DB)
	if ok {
		return tx
	}
	return r.gormDB.WithContext(ctx)
}

func (r *departmentRepository) GetByID(ctx context.Context, id uint) (*model.Department, error) {
	var dept model.Department
	err := r.db(ctx).First(&dept, id).Error
	if err != nil {
		return nil, err
	}
	return &dept, nil
}

func (r *departmentRepository) ListByIDs(ctx context.Context, ids []uint) (map[uint]*model.Department, error) {
	var depts []*model.Department
	err := r.db(ctx).Where("id IN ?", ids).Find(&depts).Error
	if err != nil {
		return nil, err
	}

	res := make(map[uint]*model.Department)
	for _, dept := range depts {
		res[dept.ID] = dept
	}
	return res, nil
}

func (r *departmentRepository) FindAll(ctx context.Context) ([]*model.Department, error) {
	var depts []*model.Department
	err := r.db(ctx).Order("id ASC").Find(&depts).Error
	if err != nil {
		return nil, err
	}
	return depts, nil
}
