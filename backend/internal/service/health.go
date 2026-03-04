package service

import (
	"context"
	"time"

	"hcrm/backend/internal/repository"
	"hcrm/backend/internal/schema/vo"
)

// HealthService 健康检查服务接口
type HealthService interface {
	Check(ctx context.Context) (*vo.HealthResponse, error)
}

// healthService 健康检查服务实现
type healthService struct {
	repo repository.HealthRepository
}

// NewHealthService 创建健康检查服务
func NewHealthService(repo repository.HealthRepository) HealthService {
	return &healthService{repo: repo}
}

// Check 执行健康检查
func (s *healthService) Check(ctx context.Context) (*vo.HealthResponse, error) {
	dbStatus := "ok"
	if err := s.repo.Ping(ctx); err != nil {
		dbStatus = "error"
	}

	return &vo.HealthResponse{
		Status:    "ok",
		Timestamp: time.Now(),
		Database:  dbStatus,
		Version:   "1.0.0",
	}, nil
}

// ProviderSet Wire Provider Set
// var ProviderSet = wire.NewSet(NewHealthService)