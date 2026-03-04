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
	Title        string `json:"title,omitempty"`
	Specialty    string `json:"specialty,omitempty"`
	Introduction string `json:"introduction,omitempty"`
}

// RoleVO 角色简要信息
type RoleVO struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}
