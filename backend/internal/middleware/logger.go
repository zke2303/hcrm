package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"hcrm/backend/internal/pkg/logger"
)

// Logger 日志中间件
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		// 处理请求
		c.Next()

		// 请求完成后记录日志
		latency := time.Since(start)
		status := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method

		if query != "" {
			path = path + "?" + query
		}

		fields := []zap.Field{
			zap.Int("status", status),
			zap.String("method", method),
			zap.String("path", path),
			zap.String("ip", clientIP),
			zap.Duration("latency", latency),
			zap.Int("body_size", c.Writer.Size()),
		}

		// 根据状态码选择日志级别
		switch {
		case status >= 500:
			logger.Error("HTTP Request", fields...)
		case status >= 400:
			logger.Warn("HTTP Request", fields...)
		default:
			logger.Info("HTTP Request", fields...)
		}
	}
}