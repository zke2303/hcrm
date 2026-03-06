package handler

import (
	"strconv"

	"hcrm/backend/internal/schema/dto"
	"hcrm/backend/internal/service"

	"github.com/gin-gonic/gin"
)

// DoctorHandler 医生处理器
type DoctorHandler struct {
	doctorService service.DoctorService
}

// NewDoctorHandler 创建医生处理器
func NewDoctorHandler(doctorService service.DoctorService) *DoctorHandler {
	return &DoctorHandler{doctorService: doctorService}
}

// RegisterDoctorRoutes 注册医生模块路由
func RegisterDoctorRoutes(r *gin.RouterGroup, h *DoctorHandler) {
	doctors := r.Group("/v1/doctors")
	{
		doctors.GET("", h.List)
		doctors.POST("", h.Create)
		doctors.GET("/:id", h.GetByID)
		doctors.PUT("/:id", h.Update)
		doctors.DELETE("/:id", h.Delete)
	}
}

// List 医生列表
func (h *DoctorHandler) List(c *gin.Context) {
	var req dto.ListDoctorRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.Error(err)
		return
	}

	if req.Page == 0 {
		req.Page = 1
	}
	if req.PageSize == 0 {
		req.PageSize = 10
	}

	res, err := h.doctorService.List(c.Request.Context(), &req)
	if err != nil {
		c.Error(err)
		return
	}

	Success(c, res)
}

// Create 新增医生
func (h *DoctorHandler) Create(c *gin.Context) {
	var req dto.CreateDoctorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(err)
		return
	}

	res, err := h.doctorService.Create(c.Request.Context(), &req)
	if err != nil {
		c.Error(err)
		return
	}

	Success(c, res)
}

// GetByID 医生详情
func (h *DoctorHandler) GetByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	res, err := h.doctorService.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		c.Error(err)
		return
	}

	Success(c, res)
}

// Update 更新医生
func (h *DoctorHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var req dto.UpdateDoctorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.Error(err)
		return
	}

	err := h.doctorService.Update(c.Request.Context(), uint(id), &req)
	if err != nil {
		c.Error(err)
		return
	}

	Success(c, nil)
}

// Delete 删除医生
func (h *DoctorHandler) Delete(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	err := h.doctorService.Delete(c.Request.Context(), uint(id))
	if err != nil {
		c.Error(err)
		return
	}

	Success(c, nil)
}
