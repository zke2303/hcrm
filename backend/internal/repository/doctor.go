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
