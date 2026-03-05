package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"hcrm/backend/internal/errors"
	"hcrm/backend/internal/schema/dto"
	"hcrm/backend/internal/service"
)

// UserHandler 用户处理器
type UserHandler struct {
	userSvc service.UserService
}

// NewUserHandler 创建用户处理器
func NewUserHandler(userSvc service.UserService) *UserHandler {
	return &UserHandler{userSvc: userSvc}
}

// Create 创建用户
func (h *UserHandler) Create(c *gin.Context) {
	var req dto.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}

	resp, err := h.userSvc.Create(c.Request.Context(), &req)
	if err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, resp)
}

// Update 更新用户
func (h *UserHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("无效的用户ID"))
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}

	if err := h.userSvc.Update(c.Request.Context(), uint(id), &req); err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, nil)
}

// Delete 删除用户
func (h *UserHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("无效的用户ID"))
		return
	}

	if err := h.userSvc.Delete(c.Request.Context(), uint(id)); err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, nil)
}

// GetByID 获取用户详情
func (h *UserHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("无效的用户ID"))
		return
	}

	user, err := h.userSvc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, user)
}

// List 用户列表
func (h *UserHandler) List(c *gin.Context) {
	var req dto.ListUserRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}

	resp, err := h.userSvc.List(c.Request.Context(), &req)
	if err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, resp)
}

// UpdateStatus 更新用户状态
func (h *UserHandler) UpdateStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("无效的用户ID"))
		return
	}

	var req dto.UpdateUserStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}

	if err := h.userSvc.UpdateStatus(c.Request.Context(), uint(id), req.Status); err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, nil)
}

// ResetPassword 重置密码
func (h *UserHandler) ResetPassword(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("无效的用户ID"))
		return
	}

	var req dto.ResetUserPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}

	if err := h.userSvc.ResetPassword(c.Request.Context(), uint(id), req.Password); err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, nil)
}

// ListRoles 获取所有角色列表
func (h *UserHandler) ListRoles(c *gin.Context) {
	roles, err := h.userSvc.ListRoles(c.Request.Context())
	if err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, roles)
}

// ListTitles 获取所有职称列表
func (h *UserHandler) ListTitles(c *gin.Context) {
	titles, err := h.userSvc.ListTitles(c.Request.Context())
	if err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, titles)
}

// ListDepartments 获取所有科室列表
func (h *UserHandler) ListDepartments(c *gin.Context) {
	depts, err := h.userSvc.ListDepartments(c.Request.Context())
	if err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, depts)
}

// ChangePassword 用户修改密码
func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		_ = c.Error(errors.ErrUnauthorized.WithMessage("未登录"))
		return
	}

	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}

	if err := h.userSvc.ChangePassword(c.Request.Context(), userID.(uint), &req); err != nil {
		_ = c.Error(err)
		return
	}

	Success(c, nil)
}

// RegisterUserRoutes 注册用户模块路由
func RegisterUserRoutes(r *gin.RouterGroup, h *UserHandler) {
	users := r.Group("/v1/users")
	{
		users.GET("", h.List)
		users.GET("/roles", h.ListRoles)
		users.GET("/titles", h.ListTitles)
		users.GET("/departments", h.ListDepartments)
		users.POST("", h.Create)
		users.GET("/:id", h.GetByID)
		users.PUT("/:id", h.Update)
		users.DELETE("/:id", h.Delete)
		users.PUT("/:id/status", h.UpdateStatus)
		users.PUT("/:id/password", h.ResetPassword)
		users.PUT("/me/password", h.ChangePassword)
	}
}
