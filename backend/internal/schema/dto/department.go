package dto

// UpdateDeptHierarchyRequest 更新科室层级请求
type UpdateDeptHierarchyRequest struct {
	ParentID *uint `json:"parentId"`
}

// AssignStaffToDeptRequest 分配医生到科室请求
type AssignStaffToDeptRequest struct {
	DoctorID uint   `json:"doctorId" binding:"required"`
	DeptIDs  []uint `json:"deptIds" binding:"required"`
}

// CreateDeptRequest 创建科室/组织机构请求
type CreateDeptRequest struct {
	Name     string `json:"name" binding:"required"`
	Code     string `json:"code" binding:"required"`
	ParentID *uint  `json:"parentId"`
	Type     int8   `json:"type" binding:"required"` // 1-医院，2-科室
	Status   int8   `json:"status"`
}
