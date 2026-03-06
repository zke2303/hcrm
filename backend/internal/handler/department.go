package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"hcrm/backend/internal/schema/dto"
	"hcrm/backend/internal/service"
)

// DepartmentHandler 科室处理器
type DepartmentHandler struct {
	deptSvc service.DepartmentService
}

// NewDepartmentHandler 创建科室处理器
func NewDepartmentHandler(deptSvc service.DepartmentService) *DepartmentHandler {
	return &DepartmentHandler{deptSvc: deptSvc}
}

// GetTree 获取全量科室树
func (h *DepartmentHandler) GetTree(c *gin.Context) {
	tree, err := h.deptSvc.GetFullTree(c.Request.Context())
	if err != nil {
		_ = c.Error(err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": tree, "msg": "success"})
}

// GetStaffByDept 获取指定节点下的人员列表（递归且分组）
func (h *DepartmentHandler) GetStaffByDept(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	staff, err := h.deptSvc.GetStaffByDeptRecursive(c.Request.Context(), uint(id))
	if err != nil {
		_ = c.Error(err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": staff, "msg": "success"})
}

// UpdateHierarchy 更新科室层级
func (h *DepartmentHandler) UpdateHierarchy(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var req dto.UpdateDeptHierarchyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(err)
		return
	}

	if err := h.deptSvc.UpdateHierarchy(c.Request.Context(), uint(id), req.ParentID); err != nil {
		_ = c.Error(err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": nil, "msg": "更新成功"})
}

// Create 创建组织节点
func (h *DepartmentHandler) Create(c *gin.Context) {
	var req dto.CreateDeptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(err)
		return
	}

	if err := h.deptSvc.Create(c.Request.Context(), &req); err != nil {
		_ = c.Error(err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": nil, "msg": "创建成功"})
}

// Delete 删除组织节点
func (h *DepartmentHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	if err := h.deptSvc.Delete(c.Request.Context(), uint(id)); err != nil {
		_ = c.Error(err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": nil, "msg": "删除成功"})
}

// AssignStaff 分配人员到科室
func (h *DepartmentHandler) AssignStaff(c *gin.Context) {
	var req dto.AssignStaffToDeptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		_ = c.Error(err)
		return
	}

	if err := h.deptSvc.AssignStaffToDepts(c.Request.Context(), req.DoctorID, req.DeptIDs); err != nil {
		_ = c.Error(err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": nil, "msg": "分配成功"})
}

// RegisterDepartmentRoutes 注册科室路由
func RegisterDepartmentRoutes(r *gin.RouterGroup, h *DepartmentHandler) {
	depts := r.Group("/departments")
	{
		depts.GET("/tree", h.GetTree)
		depts.GET("/:id/staff", h.GetStaffByDept)
		depts.PUT("/:id/hierarchy", h.UpdateHierarchy)
		depts.POST("", h.Create)
		depts.POST("/staff-move", h.AssignStaff)
		depts.DELETE("/:id", h.Delete)
	}
}
