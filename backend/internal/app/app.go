package app

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"hcrm/backend/internal/config"
	"hcrm/backend/internal/handler"
	"hcrm/backend/internal/middleware"
	"hcrm/backend/internal/pkg/auth"
)

// App 应用结构
type App struct {
	router *gin.Engine
	config *config.Config
	logger *zap.Logger
	db     *gorm.DB
	redis  *redis.Client
	server *http.Server

	// Handlers
	healthHandler *handler.HealthHandler
	authHandler   *handler.AuthHandler
	userHandler   *handler.UserHandler

	// Middleware components
	jwt *auth.JWTHelper
}

// New 创建应用实例
func New(
	cfg *config.Config,
	log *zap.Logger,
	db *gorm.DB,
	redis *redis.Client,
	healthHandler *handler.HealthHandler,
	authHandler *handler.AuthHandler,
	userHandler *handler.UserHandler,
	jwt *auth.JWTHelper,
) *App {
	// 设置 Gin 模式
	gin.SetMode(cfg.Server.Mode)

	// 创建路由引擎
	router := gin.New()

	app := &App{
		router:        router,
		config:        cfg,
		logger:        log,
		db:            db,
		redis:         redis,
		healthHandler: healthHandler,
		authHandler:   authHandler,
		userHandler:   userHandler,
		jwt:           jwt,
	}

	// 注册全局中间件
	app.registerMiddlewares()

	// 注册路由
	app.registerRoutes()

	return app
}

// registerMiddlewares 注册全局中间件
func (a *App) registerMiddlewares() {
	a.router.Use(middleware.Recovery())
	a.router.Use(middleware.Logger())
	a.router.Use(middleware.CORS())
}

// registerRoutes 注册路由
func (a *App) registerRoutes() {
	// 公开路由组
	public := a.router.Group("/api")
	{
		// 健康检查
		handler.RegisterHealthRoutes(public, a.healthHandler)
		// 认证
		handler.RegisterAuthRoutes(public, a.authHandler)
	}

	// 受保护路由组（需要认证）
	protected := a.router.Group("/api")
	protected.Use(middleware.Auth(a.jwt))
	{
		handler.RegisterUserRoutes(protected, a.userHandler)
	}
}

// Run 启动应用
func (a *App) Run() error {
	addr := fmt.Sprintf(":%d", a.config.Server.Port)

	a.server = &http.Server{
		Addr:         addr,
		Handler:      a.router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	a.logger.Info("服务器启动", zap.Int("port", a.config.Server.Port))

	if err := a.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return fmt.Errorf("启动服务器失败: %w", err)
	}

	return nil
}

// Stop 停止应用
func (a *App) Stop(ctx context.Context) error {
	a.logger.Info("服务器正在关闭...")

	if err := a.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("关闭服务器失败: %w", err)
	}

	a.logger.Info("服务器已关闭")
	return nil
}
