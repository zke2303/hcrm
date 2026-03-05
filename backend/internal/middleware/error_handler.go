package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"hcrm/backend/internal/errors"
)

// ErrorHandler 统一错误处理中间件
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// 检查是否有错误
		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err

			var resp errors.Error
			var httpStatus int

			// 类型断言判断是否为自定义业务错误
			if bizErr, ok := err.(*errors.Error); ok {
				resp = *bizErr
				httpStatus = bizErr.HTTPStatus()
			} else {
				// 系统原始错误或其他类型错误
				resp = errors.Error{
					Code:    50000,
					Message: err.Error(),
				}
				httpStatus = http.StatusInternalServerError
			}

			// 统一输出 JSON 响应
			// 注意：如果之前已经有输出（比如参数校验失败手动返回了），这里可能会冲掉或产生警告
			// 规范要求 Handler 遇到错误只需 c.Error(err) 并 return，所以理论上此时未输出 Body
			c.JSON(httpStatus, resp)

			// 终止后续操作
			c.Abort()
		}
	}
}
