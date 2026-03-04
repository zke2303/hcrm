package model

import (
	"time"
)

// Role 角色表
type Role struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:50;unique;not null;comment:角色名称" json:"name"`
	Description string    `gorm:"size:200;comment:角色描述" json:"description"`
	DataScope   int8      `gorm:"not null;default:1;comment:数据范围：1-全部，2-本部门，3-本人，4-自定义" json:"dataScope"`
	IsSystem    int8      `gorm:"not null;default:0;comment:是否系统内置" json:"isSystem"`
	CreatorID   *uint     `json:"creatorId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Role) TableName() string {
	return "roles"
}
