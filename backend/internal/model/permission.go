package model

import (
	"time"
)

// Permission 权限条目表
type Permission struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ParentID  *uint     `gorm:"index;comment:上级权限ID" json:"parentId"`
	Name      string    `gorm:"size:50;not null;comment:权限名称" json:"name"`
	Code      string    `gorm:"size:100;unique;not null;comment:权限标识" json:"code"`
	Type      int8      `gorm:"not null;default:1;comment:类型：1-目录，2-菜单，3-按钮，4-接口" json:"type"`
	Path      string    `gorm:"size:200;comment:路由路径" json:"path"`
	Component string    `gorm:"size:200;comment:组件路径" json:"component"`
	Icon      string    `gorm:"size:50;comment:图标" json:"icon"`
	SortOrder int       `gorm:"not null;default:0;comment:排序" json:"sortOrder"`
	Status    int8      `gorm:"not null;default:1;comment:状态：0-禁用，1-启用" json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (Permission) TableName() string {
	return "permissions"
}
