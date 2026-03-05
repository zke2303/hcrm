package repository

import (
	"context"

	"hcrm/backend/internal/model"

	"gorm.io/gorm"
)

// DoctorRepository 医生/员工仓储接口
type DoctorRepository interface {
	GetByUserID(ctx context.Context, userID uint) (*model.Doctor, error)
	Create(ctx context.Context, doctor *model.Doctor) error
	Update(ctx context.Context, doctor *model.Doctor) error
	UpdateDepartments(ctx context.Context, doctorID uint, deptIDs []uint, primaryDeptID uint) error
	FindInDepartments(ctx context.Context, deptIDs []uint) (map[uint][]*model.Doctor, error)
	RemoveFromDepartment(ctx context.Context, doctorID uint, deptID uint) error
}

type doctorRepository struct {
	gormDB *gorm.DB
}

// NewDoctorRepository 创建医生仓储
func NewDoctorRepository(db *gorm.DB) DoctorRepository {
	return &doctorRepository{gormDB: db}
}

func (r *doctorRepository) db(ctx context.Context) *gorm.DB {
	// 尝试从 context 中获取事务 DB（使用与 UserRepository 相同的 txKey）
	tx, ok := ctx.Value(txKey{}).(*gorm.DB)
	if ok {
		return tx
	}
	return r.gormDB.WithContext(ctx)
}

func (r *doctorRepository) GetByUserID(ctx context.Context, userID uint) (*model.Doctor, error) {
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

func (r *doctorRepository) Create(ctx context.Context, doctor *model.Doctor) error {
	return r.db(ctx).Create(doctor).Error
}

func (r *doctorRepository) Update(ctx context.Context, doctor *model.Doctor) error {
	return r.db(ctx).Save(doctor).Error
}

func (r *doctorRepository) UpdateDepartments(ctx context.Context, doctorID uint, deptIDs []uint, primaryDeptID uint) error {
	// 开启事务处理多对多更新
	// 先删除旧的
	err := r.db(ctx).Where("doctor_id = ?", doctorID).Delete(&model.DoctorDepartment{}).Error
	if err != nil {
		return err
	}

	if len(deptIDs) == 0 {
		return nil
	}

	// 插入新的
	var doctorDepts []model.DoctorDepartment
	for _, deptID := range deptIDs {
		doctorDepts = append(doctorDepts, model.DoctorDepartment{
			DoctorID:     doctorID,
			DepartmentID: deptID,
			IsPrimary:    deptID == primaryDeptID,
		})
	}

	// 如果 primaryDeptID 不在 deptIDs 中，也需要插入
	foundPrimary := false
	for _, deptID := range deptIDs {
		if deptID == primaryDeptID {
			foundPrimary = true
			break
		}
	}
	if !foundPrimary && primaryDeptID != 0 {
		doctorDepts = append(doctorDepts, model.DoctorDepartment{
			DoctorID:     doctorID,
			DepartmentID: primaryDeptID,
			IsPrimary:    true,
		})
	}

	return r.db(ctx).Create(&doctorDepts).Error
}

func (r *doctorRepository) FindInDepartments(ctx context.Context, deptIDs []uint) (map[uint][]*model.Doctor, error) {
	if len(deptIDs) == 0 {
		return make(map[uint][]*model.Doctor), nil
	}

	var results []struct {
		DeptID uint `gorm:"column:dept_id"`
		model.Doctor
	}

	// 联表查询特定科室下的医生
	err := r.db(ctx).Table("doctors").
		Select("doctor_departments.department_id as dept_id, doctors.*").
		Joins("JOIN doctor_departments ON doctors.id = doctor_departments.doctor_id").
		Where("doctor_departments.department_id IN ?", deptIDs).
		Where("doctors.deleted_at IS NULL").
		Where("doctor_departments.deleted_at IS NULL").
		Find(&results).Error
	if err != nil {
		return nil, err
	}

	res := make(map[uint][]*model.Doctor)
	for _, item := range results {
		res[item.DeptID] = append(res[item.DeptID], &item.Doctor)
	}
	return res, nil
}

func (r *doctorRepository) RemoveFromDepartment(ctx context.Context, doctorID uint, deptID uint) error {
	return r.db(ctx).Where("doctor_id = ? AND department_id = ?", doctorID, deptID).Delete(&model.DoctorDepartment{}).Error
}
