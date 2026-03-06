package vo

import "time"

// DoctorVO 医生信息响应
type DoctorVO struct {
	ID             uint      `json:"id"`
	UserID         uint      `json:"userId"`
	Username       string    `json:"username"` // 登录名，同手机号
	RealName       string    `json:"realName"`
	Phone          string    `json:"phone"`
	Email          string    `json:"email"`
	EmployeeNo     string    `json:"employeeNo"`
	DepartmentID   uint      `json:"departmentId"`
	DepartmentName string    `json:"departmentName"`
	Title          string    `json:"title"`
	Specialty      string    `json:"specialty"`
	Introduction   string    `json:"introduction"`
	AvatarURL      string    `json:"avatarUrl"`
	Status         int8      `json:"status"` // 0-离职, 1-在职
	CreatedAt      time.Time `json:"createdAt"`
	Roles          []RoleVO  `json:"roles"`
}
