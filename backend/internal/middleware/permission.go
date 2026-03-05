package middleware

import (
	"net/http"

	"hcrm/backend/internal/service"

	"github.com/gin-gonic/gin"
)

// Permission 权限校验中间件
// 基于 API 路径自动拦截。如需手动校验权限码，可另行调用 Service 方法。
func Permission(authSvc service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDVal, ok := c.Get("userID")
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    40001,
				"message": "用户未认证",
			})
			c.Abort()
			return
		}

		userID := userIDVal.(uint)

		// 1. 获取当前路由模式路径 (如 /api/v1/users/:id)
		path := c.FullPath()
		if path == "" {
			// 如果没有匹配到路径（可能是 404），则放行交给 Gin 处理
			c.Next()
			return
		}

		// 2. 校验权限
		allowed, err := authSvc.HasPermission(c.Request.Context(), userID, path)
		if err != nil || !allowed {
			c.JSON(http.StatusForbidden, gin.H{
				"code":    40003,
				"message": "权限不足：您无权访问该功能",
				"path":    path,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
