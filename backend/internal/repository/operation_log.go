package repository

import (
	"context"

	"hcrm/backend/internal/model"

	"gorm.io/gorm"
)

// OperationLogRepository 操作日志仓储接口
type OperationLogRepository interface {
	Create(ctx context.Context, log *model.OperationLog) error
}

type operationLogRepository struct {
	db *gorm.DB
}

// NewOperationLogRepository 创建操作日志仓储
func NewOperationLogRepository(db *gorm.DB) OperationLogRepository {
	return &operationLogRepository{db: db}
}

func (r *operationLogRepository) Create(ctx context.Context, log *model.OperationLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}
