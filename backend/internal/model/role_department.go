package model

import (
	"time"
)

// RoleDept 角色-数据权限科室关联表
type RoleDept struct {
	RoleID       uint      `gorm:"primaryKey;autoIncrement:false" json:"roleId"`
	DepartmentID uint      `gorm:"primaryKey;autoIncrement:false" json:"departmentId"`
	CreatedAt    time.Time `json:"createdAt"`
}

func (RoleDept) TableName() string {
	return "sys_role_depts"
}
