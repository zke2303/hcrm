//go:build wireinject

package injector

import (
	"github.com/google/wire"

	"hcrm/backend/internal/app"
	"hcrm/backend/internal/config"
	"hcrm/backend/internal/handler"
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
		// 日志
		logger.New,
		// 数据库
		database.NewMySQL,
		// 仓储层
		repository.NewHealthRepository,
		// 服务层
		service.NewHealthService,
		// 处理器层
		handler.NewHealthHandler,
		// 应用
		app.New,
	)
	return nil, nil, nil
}

// provideConfig 提供配置实例
func provideConfig(configPath string) (*config.Config, error) {
	return config.Load(configPath)
}