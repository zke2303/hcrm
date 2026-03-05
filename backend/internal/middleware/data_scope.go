package middleware

import (
	"hcrm/backend/internal/service"

	"github.com/gin-gonic/gin"
)

// DataScope 数据权限中间件
// 将用户的权限范围（Scope）和可访问科室 ID 列表存入上下文，供 Repository 层下钻查询。
func DataScope(authSvc service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDVal, ok := c.Get("userID")
		if !ok {
			c.Next()
			return
		}

		userID := userIDVal.(uint)
		scope, deptIDs, err := authSvc.GetDataScope(c.Request.Context(), userID)
		if err == nil {
			c.Set("dataScope", scope)
			c.Set("dataDeptIDs", deptIDs)
		}
		c.Next()
	}
}
