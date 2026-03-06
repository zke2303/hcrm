package repository

import (
	"context"

	"hcrm/backend/internal/model"
	"hcrm/backend/internal/schema/dto"

	"gorm.io/gorm"
)

// DoctorRepository 医生/员工仓储接口
type DoctorRepository interface {
	Transaction(ctx context.Context, fn func(txCtx context.Context) error) error
	GetByID(ctx context.Context, id uint) (*model.Doctor, error)
	GetByUserID(ctx context.Context, userID uint) (*model.Doctor, error)
	GetByPhone(ctx context.Context, phone string) (*model.Doctor, error)
	List(ctx context.Context, req *dto.ListDoctorRequest) ([]*model.Doctor, int64, error)
	Create(ctx context.Context, doctor *model.Doctor) error
	Update(ctx context.Context, doctor *model.Doctor) error
	Delete(ctx context.Context, id uint) error
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
	// 尝试从 context 中获取事务 DB
	tx, ok := ctx.Value(txKey{}).(*gorm.DB)
	if ok {
		return tx
	}
	return r.gormDB.WithContext(ctx)
}

func (r *doctorRepository) Transaction(ctx context.Context, fn func(txCtx context.Context) error) error {
	return r.gormDB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(context.WithValue(ctx, txKey{}, tx))
	})
}

func (r *doctorRepository) GetByID(ctx context.Context, id uint) (*model.Doctor, error) {
	var doctor model.Doctor
	err := r.db(ctx).First(&doctor, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &doctor, nil
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

func (r *doctorRepository) GetByPhone(ctx context.Context, phone string) (*model.Doctor, error) {
	var doctor model.Doctor
	err := r.db(ctx).Where("phone = ?", phone).First(&doctor).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &doctor, nil
}

func (r *doctorRepository) List(ctx context.Context, req *dto.ListDoctorRequest) ([]*model.Doctor, int64, error) {
	var doctors []*model.Doctor
	var total int64
	query := r.db(ctx).Model(&model.Doctor{})

	if req.Keyword != "" {
		k := "%" + req.Keyword + "%"
		query = query.Where("real_name LIKE ? OR phone LIKE ? OR employee_no LIKE ?", k, k, k)
	}

	if req.DepartmentID != nil {
		// 联表查询科室
		query = query.Joins("JOIN doctor_departments ON doctors.id = doctor_departments.doctor_id").
			Where("doctor_departments.department_id = ?", *req.DepartmentID)
	}

	if req.Status != nil {
		query = query.Where("status = ?", *req.Status)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (req.Page - 1) * req.PageSize
	err = query.Offset(offset).Limit(req.PageSize).Order("id DESC").Find(&doctors).Error
	if err != nil {
		return nil, 0, err
	}

	return doctors, total, nil
}

func (r *doctorRepository) Create(ctx context.Context, doctor *model.Doctor) error {
	return r.db(ctx).Create(doctor).Error
}

func (r *doctorRepository) Update(ctx context.Context, doctor *model.Doctor) error {
	return r.db(ctx).Save(doctor).Error
}

func (r *doctorRepository) Delete(ctx context.Context, id uint) error {
	return r.db(ctx).Delete(&model.Doctor{}, id).Error
}

func (r *doctorRepository) UpdateDepartments(ctx context.Context, doctorID uint, deptIDs []uint, primaryDeptID uint) error {
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
