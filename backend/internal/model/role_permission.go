package model

import (
	"time"
)

// RolePermission 角色-权限关联表
type RolePermission struct {
	RoleID       uint      `gorm:"primaryKey;autoIncrement:false" json:"roleId"`
	PermissionID uint      `gorm:"primaryKey;autoIncrement:false" json:"permissionId"`
	CreatedAt    time.Time `json:"createdAt"`
}

func (RolePermission) TableName() string {
	return "role_permissions"
}
