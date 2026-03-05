package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"hcrm/backend/internal/service"
)

// HealthHandler 健康检查处理器
type HealthHandler struct {
	svc service.HealthService
}

// NewHealthHandler 创建健康检查处理器
func NewHealthHandler(svc service.HealthService) *HealthHandler {
	return &HealthHandler{svc: svc}
}

// Check 健康检查接口
func (h *HealthHandler) Check(c *gin.Context) {
	result, err := h.svc.Check(c.Request.Context())
	if err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, result)
}

// RegisterHealthRoutes 注册健康检查路由
func RegisterHealthRoutes(r *gin.RouterGroup, h *HealthHandler) {
	r.GET("/health", h.Check)
}

// Response 统一响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

// SuccessWithVO 使用 VO 成功响应
func SuccessWithVO(c *gin.Context, v interface{}) {
	c.JSON(http.StatusOK, v)
}

// Fail 失败响应
// Deprecated: 请直接在 Handler 中调用 c.Error(err) 配合 ErrorHandler 中间件处理。
func Fail(c *gin.Context, code int, message string) {
	c.JSON(http.StatusBadRequest, Response{
		Code:    code,
		Message: message,
	})
}

// FailWithStatus 带状态码的失败响应
// Deprecated: 请直接在 Handler 中调用 c.Error(err) 配合 ErrorHandler 中间件处理。
func FailWithStatus(c *gin.Context, status int, code int, message string) {
	c.JSON(status, Response{
		Code:    code,
		Message: message,
	})
}

// ProviderSet Wire Provider Set
// var ProviderSet = wire.NewSet(NewHealthHandler)
