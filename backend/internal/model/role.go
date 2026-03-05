package model

import (
	"time"
)

// Role 角色表
type Role struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:50;unique;not null;comment:角色名称" json:"name"`
	Code        string    `gorm:"size:50;unique;not null;comment:角色编码" json:"code"`
	Description string    `gorm:"size:200;comment:角色描述" json:"description"`
	DataScope   int       `gorm:"not null;default:1;comment:数据范围：1-全部，2-本机构，3-本科室，4-本人" json:"dataScope"`
	Status      int8      `gorm:"not null;default:1;comment:状态：0-禁用，1-启用" json:"status"`
	IsSystem    int8      `gorm:"not null;default:0;comment:是否系统内置" json:"isSystem"`
	CreatorID   *uint     `json:"creatorId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (Role) TableName() string {
	return "roles"
}
