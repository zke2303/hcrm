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
	FindDescendantIDs(ctx context.Context, parentID uint) ([]uint, error)
	Update(ctx context.Context, dept *model.Department) error
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
	err := r.db(ctx).Order("sort_order ASC, id ASC").Find(&depts).Error
	if err != nil {
		return nil, err
	}
	return depts, nil
}

func (r *departmentRepository) FindDescendantIDs(ctx context.Context, parentID uint) ([]uint, error) {
	// 查询全量科室以便在内存中处理层级
	var allDepts []*model.Department
	if err := r.db(ctx).Find(&allDepts).Error; err != nil {
		return nil, err
	}

	// 映射表加速查找
	deptMap := make(map[uint][]uint)
	for _, d := range allDepts {
		if d.ParentID != nil {
			deptMap[*d.ParentID] = append(deptMap[*d.ParentID], d.ID)
		}
	}

	// 递归收集
	var res []uint
	var collect func(id uint)
	collect = func(id uint) {
		res = append(res, id)
		for _, childID := range deptMap[id] {
			collect(childID)
		}
	}

	// 如果 parentID 为 0，通常代表查询全院
	if parentID == 0 {
		for _, d := range allDepts {
			res = append(res, d.ID)
		}
		return res, nil
	}

	collect(parentID)
	return res, nil
}

func (r *departmentRepository) Update(ctx context.Context, dept *model.Department) error {
	return r.db(ctx).Save(dept).Error
}
