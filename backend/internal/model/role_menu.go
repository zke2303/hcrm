package model

import (
	"time"
)

// RoleMenu 角色-菜单关联表
type RoleMenu struct {
	RoleID    uint      `gorm:"primaryKey;autoIncrement:false" json:"roleId"`
	MenuID    uint      `gorm:"primaryKey;autoIncrement:false" json:"menuId"`
	CreatedAt time.Time `json:"createdAt"`
}

func (RoleMenu) TableName() string {
	return "sys_role_menus"
}
