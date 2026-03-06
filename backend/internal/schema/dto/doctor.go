package dto

// CreateDoctorRequest 新增医生请求
type CreateDoctorRequest struct {
	RealName     string `json:"realName" binding:"required"`
	Phone        string `json:"phone" binding:"required,len=11"`
	DepartmentID uint   `json:"departmentId" binding:"required"`
	Title        string `json:"title" binding:"required"`
	RoleIDs      []uint `json:"roleIds" binding:"required"`
	EmployeeNo   string `json:"employeeNo"`
	Introduction string `json:"introduction"`
	Specialty    string `json:"specialty"`
	AvatarURL    string `json:"avatarUrl"`
}

// UpdateDoctorRequest 编辑医生请求
type UpdateDoctorRequest struct {
	RealName     string `json:"realName" binding:"required"`
	Phone        string `json:"phone" binding:"required,len=11"`
	DepartmentID uint   `json:"departmentId" binding:"required"`
	Title        string `json:"title" binding:"required"`
	RoleIDs      []uint `json:"roleIds" binding:"required"`
	EmployeeNo   string `json:"employeeNo"`
	Introduction string `json:"introduction"`
	Specialty    string `json:"specialty"`
	AvatarURL    string `json:"avatarUrl"`
	Status       *int8  `json:"status"` // 0-离职, 1-在职
}

// ListDoctorRequest 医生列表查询请求
type ListDoctorRequest struct {
	PaginationRequest
	Keyword      string `form:"keyword"`
	DepartmentID *uint  `form:"departmentId"`
	Status       *int8  `form:"status"`
}
