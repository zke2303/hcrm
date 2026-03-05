package dto

// CreateUserRequest 创建用户请求
type CreateUserRequest struct {
	Username     string `json:"username" binding:"required,min=4,max=32"`
	RealName     string `json:"realName" binding:"required"`
	Phone        string `json:"phone" binding:"required,len=11"`
	Email        string `json:"email" binding:"omitempty,email"`
	EmployeeNo   string `json:"employeeNo"`
	DepartmentID *uint  `json:"departmentId"`
	Remark       string `json:"remark"`
	RoleIDs      []uint `json:"roleIds"`

	// 联动医生档案字段
	IsDoctor     bool   `json:"isDoctor"`
	Title        string `json:"title"`
	Specialty    string `json:"specialty"`
	Introduction string `json:"introduction"`
}

// UpdateUserRequest 更新用户请求
type UpdateUserRequest struct {
	RealName     string  `json:"realName" binding:"required"`
	Phone        string  `json:"phone" binding:"required,len=11"`
	Email        string  `json:"email" binding:"omitempty,email"`
	EmployeeNo   string  `json:"employeeNo"`
	DepartmentID *uint   `json:"departmentId"`
	Remark       string  `json:"remark"`
	Status       *int8   `json:"status"` // 0-禁用, 1-启用
	RoleIDs      *[]uint `json:"roleIds"`

	// 联动医生档案字段
	IsDoctor     *bool  `json:"isDoctor"`
	Title        string `json:"title"`
	Specialty    string `json:"specialty"`
	Introduction string `json:"introduction"`
}

// ListUserRequest 用户列表查询请求
type ListUserRequest struct {
	PaginationRequest
	Keyword      string `form:"keyword"`
	Username     string `form:"username"`
	RealName     string `form:"realName"`
	Phone        string `form:"phone"`
	DepartmentID *uint  `form:"departmentId"`
	RoleID       *uint  `form:"roleId"`
	Status       *int8  `form:"status"`
	Title        string `form:"title"`
}

// UpdateUserStatusRequest 更新用户状态请求
type UpdateUserStatusRequest struct {
	Status int8 `json:"status" binding:"oneof=0 1"`
}

// ResetUserPasswordRequest 重置用户密码请求
type ResetUserPasswordRequest struct {
	Password string `json:"password" binding:"required,min=6,max=32"`
}

// ChangePasswordRequest 修改密码请求
type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword" binding:"required,min=6,max=32"`
	NewPassword string `json:"newPassword" binding:"required,min=6,max=32"`
}
