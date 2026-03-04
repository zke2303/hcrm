package vo

import (
	"time"
)

// UserVO 用户信息响应
type UserVO struct {
	ID             uint       `json:"id"`
	Username       string     `json:"username"`
	RealName       string     `json:"realName"`
	Phone          string     `json:"phone"`
	Email          string     `json:"email"`
	EmployeeNo     string     `json:"employeeNo"`
	DepartmentID   *uint      `json:"departmentId"`
	DepartmentName string     `json:"departmentName"`
	Remark         string     `json:"remark"`
	Status         int8       `json:"status"`
	LastLoginAt    *time.Time `json:"lastLoginAt"`
	CreatedAt      time.Time  `json:"createdAt"`
	Roles          []RoleVO   `json:"roles"`
	// 联动医生档案可选信息
	IsDoctor     bool   `json:"isDoctor"`
	DoctorID     *uint  `json:"doctorId,omitempty"`
	Title        string `json:"title,omitempty"`
	Specialty    string `json:"specialty,omitempty"`
	Introduction string `json:"introduction,omitempty"`
}

// CreateUserResponse 创建用户响应
type CreateUserResponse struct {
	ID              uint   `json:"id"`
	Username        string `json:"username"`
	EmployeeNo      string `json:"employeeNo"`
	DefaultPassword string `json:"defaultPassword"`
}
