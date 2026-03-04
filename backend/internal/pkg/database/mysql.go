package database

import (
	"fmt"
	"time"

	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"hcrm/backend/internal/config"
)

// NewMySQL 创建 MySQL 连接
func NewMySQL(cfg *config.DatabaseConfig, log *zap.Logger) (*gorm.DB, func(), error) {
	// GORM 日志配置
	var gormLogger logger.Interface
	if log != nil {
		gormLogger = NewGormLogger(log)
	} else {
		gormLogger = logger.Default
	}

	// 连接数据库
	db, err := gorm.Open(mysql.Open(cfg.DSN()), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return nil, nil, fmt.Errorf("连接数据库失败: %w", err)
	}

	// 获取底层 SQL DB
	sqlDB, err := db.DB()
	if err != nil {
		return nil, nil, fmt.Errorf("获取数据库连接失败: %w", err)
	}

	// 连接池配置
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// 测试连接
	if err := sqlDB.Ping(); err != nil {
		return nil, nil, fmt.Errorf("数据库连接测试失败: %w", err)
	}

	// 清理函数
	cleanup := func() {
		if sqlDB != nil {
			_ = sqlDB.Close()
		}
	}

	return db, cleanup, nil
}

// GormLogger GORM 日志适配器
type GormLogger struct {
	log *zap.Logger
}

// NewGormLogger 创建 GORM 日志适配器
func NewGormLogger(log *zap.Logger) *GormLogger {
	return &GormLogger{log: log}
}

// LogMode 设置日志模式
func (l *GormLogger) LogMode(level logger.LogLevel) logger.Interface {
	return l
}

// Info 信息日志
func (l *GormLogger) Info(msg string, data ...interface{}) {
	l.log.Sugar().Infof(msg, data...)
}

// Warn 警告日志
func (l *GormLogger) Warn(msg string, data ...interface{}) {
	l.log.Sugar().Warnf(msg, data...)
}

// Error 错误日志
func (l *GormLogger) Error(msg string, data ...interface{}) {
	l.log.Sugar().Errorf(msg, data...)
}

// Trace 追踪日志
func (l *GormLogger) Trace(begin time.Time, fc func() (sql string, rowsAffected int64), err error) {
	elapsed := time.Since(begin)
	sql, rows := fc()

	if err != nil {
		l.log.Error("SQL Error",
			zap.Error(err),
			zap.Duration("duration", elapsed),
			zap.Int64("rows", rows),
			zap.String("sql", sql),
		)
		return
	}

	l.log.Debug("SQL",
		zap.Duration("duration", elapsed),
		zap.Int64("rows", rows),
		zap.String("sql", sql),
	)
}