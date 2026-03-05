package middleware

import (
	"bytes"
	"io"
	"net/http"
	"time"

	"hcrm/backend/internal/model"
	"hcrm/backend/internal/repository"

	"github.com/gin-gonic/gin"
)

// AuditLog 操作日志中间件
// 拦截写操作（POST/PUT/DELETE），自动记录到 sys_operation_logs 表。
func AuditLog(logRepo repository.OperationLogRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 仅记录写操作
		method := c.Request.Method
		if method == http.MethodGet || method == http.MethodOptions || method == http.MethodHead {
			c.Next()
			return
		}

		// 读取请求体 (需原样写回供后续 Handler 使用)
		var body []byte
		if c.Request.Body != nil {
			body, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(body))
		}

		startTime := time.Now()

		// 获取用户信息 (依赖 Auth 中间件)
		userIDVal, _ := c.Get("userID")
		usernameVal, _ := c.Get("username")

		// 执行后续流程
		c.Next()

		// 异步存储日志
		go func() {
			userID, _ := userIDVal.(uint)
			username, _ := usernameVal.(string)

			log := &model.OperationLog{
				Module:        "系统模块", // 理想情况可从路由元数据获取
				Action:        method,
				IPAddress:     c.ClientIP(),
				RequestMethod: method,
				RequestURL:    c.Request.URL.Path,
				RequestParams: string(body),
				ExecutionTime: int(time.Since(startTime).Milliseconds()),
				Status:        int8(1),
			}
			if userID != 0 {
				log.UserID = &userID
				log.Username = username
			}
			if len(c.Errors) > 0 {
				log.Status = 0
				log.ErrorMsg = c.Errors.String()
			}

			// 使用 Background context 防止被主请求取消
			_ = logRepo.Create(c, log)
		}()
	}
}
