package handler

import (
	"github.com/gin-gonic/gin"

	"hcrm/backend/internal/schema/vo"
	"hcrm/backend/internal/service"
)

// AuthHandler 认证处理器
type AuthHandler struct {
	authSvc service.AuthService
}

// NewAuthHandler 创建认证处理器
func NewAuthHandler(authSvc service.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

// Login 用户登录接口
func (h *AuthHandler) Login(c *gin.Context) {
	var req vo.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, 40001, "请求参数无效")
		return
	}

	ip := c.ClientIP()
	resp, err := h.authSvc.Login(c.Request.Context(), &req, ip)
	if err != nil {
		Fail(c, 40101, err.Error())
		return
	}

	// 设置 Refresh Token 到 Cookie (HttpOnly)
	c.SetCookie("refresh_token", resp.RefreshToken, 7*24*3600, "/", "", false, true)

	Success(c, resp)
}

// Refresh 刷新令牌接口
func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		Fail(c, 40102, "无刷新令牌")
		return
	}

	accessToken, err := h.authSvc.Refresh(c.Request.Context(), refreshToken)
	if err != nil {
		Fail(c, 40103, err.Error())
		return
	}

	Success(c, vo.TokenRefreshResponse{
		AccessToken: accessToken,
	})
}

// Logout 用户注销接口
func (h *AuthHandler) Logout(c *gin.Context) {
	// 清除 Cookie
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
	Success(c, nil)
}

// RegisterAuthRoutes 注册认证路由
func RegisterAuthRoutes(r *gin.RouterGroup, h *AuthHandler) {
	authGroup := r.Group("/v1/auth")
	{
		authGroup.POST("/login", h.Login)
		authGroup.POST("/refresh", h.Refresh)
		authGroup.POST("/logout", h.Logout)
	}
}
