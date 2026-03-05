package dto

type CreateRoleRequest struct {
	Name        string `json:"name" binding:"required"`
	Code        string `json:"code" binding:"required"`
	Description string `json:"description"`
	DataScope   int    `json:"dataScope"`
	Status      int8   `json:"status"`
}

type UpdateRoleRequest struct {
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	DataScope   int    `json:"dataScope"`
	Status      int8   `json:"status"`
}

type ListRoleRequest struct {
	Name   string `form:"name"`
	Status *int8  `form:"status"`
}

type AssignMenuRequest struct {
	MenuIDs []uint `json:"menuIds" binding:"required"`
}

type AssignDeptRequest struct {
	DeptIDs []uint `json:"deptIds" binding:"required"`
}

type UpdateRoleStatusRequest struct {
	Status int8 `json:"status" binding:"oneof=0 1"`
}
