package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"hcrm/backend/internal/pkg/auth"
)

// Auth 认证中间件
func Auth(jwt *auth.JWTHelper) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    20001,
				"message": "未登录或非法访问",
			})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    20002,
				"message": "认证格式错误",
			})
			c.Abort()
			return
		}

		claims, err := jwt.ParseToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    20003,
				"message": "登录已过期，请重新登录",
			})
			c.Abort()
			return
		}

		// 将用户信息存入上下文
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("departmentID", claims.DepartmentID)
		c.Next()
	}
}
