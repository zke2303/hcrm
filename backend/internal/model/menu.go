package model

import (
	"time"
)

// Menu 菜单权限表
type Menu struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ParentID  uint      `gorm:"not null;default:0;comment:父菜单ID" json:"parentId"`
	Name      string    `gorm:"size:50;not null;comment:菜单名称" json:"name"`
	Type      int       `gorm:"not null;default:1;comment:菜单类型：1-目录 2-菜单 3-按钮" json:"type"`
	Path      string    `gorm:"size:200;comment:路由地址" json:"path"`
	Component string    `gorm:"size:255;comment:组件路径" json:"component"`
	Perms     string    `gorm:"size:100;comment:权限标识" json:"perms"`
	Icon      string    `gorm:"size:100;comment:菜单图标" json:"icon"`
	SortOrder int       `gorm:"not null;default:0;comment:显示顺序" json:"sortOrder"`
	Status    int8      `gorm:"not null;default:1;comment:菜单状态：0-停用 1-正常" json:"status"`
	Visible   int8      `gorm:"not null;default:1;comment:显示状态：0-隐藏 1-显示" json:"visible"`
	ApiPath   string    `gorm:"size:255;comment:关联API路径" json:"apiPath"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (Menu) TableName() string {
	return "sys_menus"
}
