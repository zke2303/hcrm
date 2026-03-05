package handler

import (
	"strconv"

	"hcrm/backend/internal/errors"
	"hcrm/backend/internal/schema/dto"
	"hcrm/backend/internal/service"

	"github.com/gin-gonic/gin"
)

type MenuHandler struct {
	svc service.MenuService
}

func NewMenuHandler(svc service.MenuService) *MenuHandler {
	return &MenuHandler{svc: svc}
}

func (h *MenuHandler) Create(c *gin.Context) {
	var req dto.CreateMenuRequest
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

func (h *MenuHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req dto.UpdateMenuRequest
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

func (h *MenuHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.svc.Delete(c.Request.Context(), uint(id)); err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, nil)
}

func (h *MenuHandler) GetByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	menu, err := h.svc.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, menu)
}

func (h *MenuHandler) List(c *gin.Context) {
	var req dto.ListMenuRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		_ = c.Error(errors.ErrBadRequest.WithMessage("参数查询解析失败: " + err.Error()))
		return
	}
	menus, err := h.svc.ListTree(c.Request.Context(), &req)
	if err != nil {
		_ = c.Error(err)
		return
	}
	Success(c, menus)
}

func RegisterMenuRoutes(r *gin.RouterGroup, h *MenuHandler) {
	menus := r.Group("/v1/menus")
	{
		menus.GET("/list/tree", h.List)
		menus.POST("", h.Create)
		menus.GET("/:id", h.GetByID)
		menus.PUT("/:id", h.Update)
		menus.DELETE("/:id", h.Delete)
	}
}
