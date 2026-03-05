package handler

import (
	"strconv"

	"hcrm/backend/internal/errors"
	"hcrm/backend/internal/schema/dto"
	"hcrm/backend/internal/service"

	"github.com/gin-gonic/gin"
)

type RoleHandler struct {
	svc service.RoleService
}

func NewRoleHandler(svc service.RoleService) *RoleHandler {
	return &RoleHandler{svc: svc}
}

func (h *RoleHandler) Create(c *gin.Context) {
	var req dto.CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}
	if err := h.svc.Create(c.Request.Context(), &req); err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, nil)
}

func (h *RoleHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req dto.UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}
	if err := h.svc.Update(c.Request.Context(), uint(id), &req); err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, nil)
}

func (h *RoleHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.svc.Delete(c.Request.Context(), uint(id)); err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, nil)
}

func (h *RoleHandler) GetByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	role, err := h.svc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, role)
}

func (h *RoleHandler) List(c *gin.Context) {
	var req dto.ListRoleRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数查询解析失败: " + err.Error()))
		return
	}
	roles, total, err := h.svc.List(c.Request.Context(), &req)
	if err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, gin.H{
		"list":  roles,
		"total": total,
	})
}

func (h *RoleHandler) UpdateStatus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req dto.UpdateRoleStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}
	if err := h.svc.UpdateStatus(c.Request.Context(), uint(id), req.Status); err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, nil)
}

func (h *RoleHandler) GetMenus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	detail, err := h.svc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, detail.MenuIDs)
}

func (h *RoleHandler) AssignMenus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req dto.AssignMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}
	if err := h.svc.UpdateMenus(c.Request.Context(), uint(id), req.MenuIDs); err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, nil)
}

func (h *RoleHandler) AssignDepts(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req dto.AssignDeptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数校验失败: " + err.Error()))
		return
	}
	if err := h.svc.UpdateDepts(c.Request.Context(), uint(id), req.DeptIDs); err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, nil)
}

func (h *RoleHandler) Copy(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	newID, err := h.svc.Copy(c.Request.Context(), uint(id))
	if err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, gin.H{"id": newID})
}

func RegisterRoleRoutes(r *gin.RouterGroup, h *RoleHandler) {
	roles := r.Group("/v1/roles")
	{
		roles.GET("", h.List)
		roles.POST("", h.Create)
		roles.GET("/:id", h.GetByID)
		roles.PUT("/:id", h.Update)
		roles.DELETE("/:id", h.Delete)
		roles.PUT("/:id/status", h.UpdateStatus)
		roles.GET("/:id/menus", h.GetMenus)
		roles.POST("/:id/menus", h.AssignMenus)
		roles.POST("/:id/depts", h.AssignDepts)
		roles.POST("/:id/copy", h.Copy)
	}
}
