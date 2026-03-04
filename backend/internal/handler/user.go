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
		Fail(c, errors.ErrBadRequest.Code, "参数校验失败: "+err.Error())
		return
	}

	if err := h.userSvc.Create(c.Request.Context(), &req); err != nil {
		if e, ok := err.(*errors.Error); ok {
			FailWithStatus(c, e.HTTPStatus(), e.Code, e.Message)
		} else {
			Fail(c, errors.ErrInternal.Code, err.Error())
		}
		return
	}

	Success(c, nil)
}

// Update 更新用户
func (h *UserHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		Fail(c, errors.ErrBadRequest.Code, "无效的用户ID")
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, errors.ErrBadRequest.Code, "参数校验失败: "+err.Error())
		return
	}

	if err := h.userSvc.Update(c.Request.Context(), uint(id), &req); err != nil {
		if e, ok := err.(*errors.Error); ok {
			FailWithStatus(c, e.HTTPStatus(), e.Code, e.Message)
		} else {
			Fail(c, errors.ErrInternal.Code, err.Error())
		}
		return
	}

	Success(c, nil)
}

// Delete 删除用户
func (h *UserHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		Fail(c, errors.ErrBadRequest.Code, "无效的用户ID")
		return
	}

	if err := h.userSvc.Delete(c.Request.Context(), uint(id)); err != nil {
		if e, ok := err.(*errors.Error); ok {
			FailWithStatus(c, e.HTTPStatus(), e.Code, e.Message)
		} else {
			Fail(c, errors.ErrInternal.Code, err.Error())
		}
		return
	}

	Success(c, nil)
}

// GetByID 获取用户详情
func (h *UserHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		Fail(c, errors.ErrBadRequest.Code, "无效的用户ID")
		return
	}

	user, err := h.userSvc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		if e, ok := err.(*errors.Error); ok {
			FailWithStatus(c, e.HTTPStatus(), e.Code, e.Message)
		} else {
			Fail(c, errors.ErrInternal.Code, err.Error())
		}
		return
	}

	Success(c, user)
}

// List 用户列表
func (h *UserHandler) List(c *gin.Context) {
	var req dto.ListUserRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		Fail(c, errors.ErrBadRequest.Code, "参数校验失败: "+err.Error())
		return
	}

	resp, err := h.userSvc.List(c.Request.Context(), &req)
	if err != nil {
		if e, ok := err.(*errors.Error); ok {
			FailWithStatus(c, e.HTTPStatus(), e.Code, e.Message)
		} else {
			Fail(c, errors.ErrInternal.Code, err.Error())
		}
		return
	}

	Success(c, resp)
}

// UpdateStatus 更新用户状态
func (h *UserHandler) UpdateStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		Fail(c, errors.ErrBadRequest.Code, "无效的用户ID")
		return
	}

	var req dto.UpdateUserStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, errors.ErrBadRequest.Code, "参数校验失败: "+err.Error())
		return
	}

	if err := h.userSvc.UpdateStatus(c.Request.Context(), uint(id), req.Status); err != nil {
		if e, ok := err.(*errors.Error); ok {
			FailWithStatus(c, e.HTTPStatus(), e.Code, e.Message)
		} else {
			Fail(c, errors.ErrInternal.Code, err.Error())
		}
		return
	}

	Success(c, nil)
}

// ResetPassword 重置密码
func (h *UserHandler) ResetPassword(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		Fail(c, errors.ErrBadRequest.Code, "无效的用户ID")
		return
	}

	var req dto.ResetUserPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, errors.ErrBadRequest.Code, "参数校验失败: "+err.Error())
		return
	}

	if err := h.userSvc.ResetPassword(c.Request.Context(), uint(id), req.Password); err != nil {
		if e, ok := err.(*errors.Error); ok {
			FailWithStatus(c, e.HTTPStatus(), e.Code, e.Message)
		} else {
			Fail(c, errors.ErrInternal.Code, err.Error())
		}
		return
	}

	Success(c, nil)
}

// ListRoles 获取所有角色列表
func (h *UserHandler) ListRoles(c *gin.Context) {
	roles, err := h.userSvc.ListRoles(c.Request.Context())
	if err != nil {
		if e, ok := err.(*errors.Error); ok {
			FailWithStatus(c, e.HTTPStatus(), e.Code, e.Message)
		} else {
			Fail(c, errors.ErrInternal.Code, err.Error())
		}
		return
	}

	Success(c, roles)
}

// ListTitles 获取所有职称列表
func (h *UserHandler) ListTitles(c *gin.Context) {
	titles, err := h.userSvc.ListTitles(c.Request.Context())
	if err != nil {
		if e, ok := err.(*errors.Error); ok {
			FailWithStatus(c, e.HTTPStatus(), e.Code, e.Message)
		} else {
			Fail(c, errors.ErrInternal.Code, err.Error())
		}
		return
	}

	Success(c, titles)
}

// RegisterUserRoutes 注册用户模块路由
func RegisterUserRoutes(r *gin.RouterGroup, h *UserHandler) {
	users := r.Group("/v1/users")
	{
		users.GET("", h.List)
		users.GET("/roles", h.ListRoles)
		users.GET("/titles", h.ListTitles)
		users.POST("", h.Create)
		users.GET("/:id", h.GetByID)
		users.PUT("/:id", h.Update)
		users.DELETE("/:id", h.Delete)
		users.PUT("/:id/status", h.UpdateStatus)
		users.PUT("/:id/password", h.ResetPassword)
	}
}
