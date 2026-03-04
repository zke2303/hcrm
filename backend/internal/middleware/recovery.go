package middleware

import (
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"hcrm/backend/internal/errors"
	"hcrm/backend/internal/pkg/logger"
)

// Recovery 异常恢复中间件
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				// 记录错误日志
				logger.Error("Panic recovered",
					zap.Any("error", r),
					zap.String("stack", string(debug.Stack())),
					zap.String("path", c.Request.URL.Path),
					zap.String("method", c.Request.Method),
				)

				// 返回服务器错误响应
				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"code":    errors.ErrInternal.Code,
					"message": "服务器内部错误",
				})
			}
		}()

		c.Next()
	}
}