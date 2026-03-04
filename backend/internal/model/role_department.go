package model

import (
	"time"
)

// RoleDepartment 角色-数据权限部门关联表
type RoleDepartment struct {
	RoleID       uint      `gorm:"primaryKey;autoIncrement:false" json:"roleId"`
	DepartmentID uint      `gorm:"primaryKey;autoIncrement:false" json:"departmentId"`
	CreatedAt    time.Time `json:"createdAt"`
}

func (RoleDepartment) TableName() string {
	return "role_departments"
}
