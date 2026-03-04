package repository

import (
	"context"

	"gorm.io/gorm"
)

// HealthRepository 健康检查仓储接口
type HealthRepository interface {
	Ping(ctx context.Context) error
}

// healthRepository 健康检查仓储实现
type healthRepository struct {
	db *gorm.DB
}

// NewHealthRepository 创建健康检查仓储
func NewHealthRepository(db *gorm.DB) HealthRepository {
	return &healthRepository{db: db}
}

// Ping 测试数据库连接
func (r *healthRepository) Ping(ctx context.Context) error {
	sqlDB, err := r.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.PingContext(ctx)
}

// ProviderSet Wire Provider Set
// var ProviderSet = wire.NewSet(NewHealthRepository)