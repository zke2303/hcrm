//go:build wireinject

package injector

import (
	"github.com/google/wire"

	"hcrm/backend/internal/app"
	"hcrm/backend/internal/config"
	"hcrm/backend/internal/handler"
	"hcrm/backend/internal/pkg/auth"
	"hcrm/backend/internal/pkg/database"
	"hcrm/backend/internal/pkg/logger"
	"hcrm/backend/internal/repository"
	"hcrm/backend/internal/service"
)

// BuildApp 构建应用（由 Wire 生成实现）
// configPath: 配置文件路径，为空则使用默认路径
func BuildApp(configPath string) (*app.App, func(), error) {
	wire.Build(
		// 配置加载
		provideConfig,
		provideDatabaseConfig,
		provideRedisConfig,
		provideLogConfig,
		provideJWTConfig,
		// 工具
		auth.NewJWTHelper,
		auth.NewLoginRateLimiter,
		// 日志
		logger.New,
		// 数据库
		database.NewMySQL,
		database.NewRedis,
		// 仓储层
		repository.NewHealthRepository,
		repository.NewUserRepository,
		repository.NewDoctorRepository,
		repository.NewDepartmentRepository,
		repository.NewOperationLogRepository,
		// 服务层
		service.NewHealthService,
		service.NewAuthService,
		service.NewUserService,
		// 处理器层
		handler.NewHealthHandler,
		handler.NewAuthHandler,
		// 应用
		app.New,
	)
	return nil, nil, nil
}

// provideConfig 提供配置实例
func provideConfig(configPath string) (*config.Config, error) {
	return config.Load(configPath)
}

func provideDatabaseConfig(cfg *config.Config) *config.DatabaseConfig {
	return &cfg.Database
}

func provideRedisConfig(cfg *config.Config) *config.RedisConfig {
	return &cfg.Redis
}

func provideLogConfig(cfg *config.Config) *config.LogConfig {
	return &cfg.Log
}

func provideJWTConfig(cfg *config.Config) *config.JWTConfig {
	return &cfg.JWT
}
