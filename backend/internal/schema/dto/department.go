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
