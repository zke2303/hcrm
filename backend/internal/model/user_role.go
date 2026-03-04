package model

import (
	"time"
)

// UserRole 用户-角色关联表
type UserRole struct {
	UserID    uint      `gorm:"primaryKey;autoIncrement:false" json:"userId"`
	RoleID    uint      `gorm:"primaryKey;autoIncrement:false" json:"roleId"`
	CreatedAt time.Time `json:"createdAt"`
}

func (UserRole) TableName() string {
	return "user_roles"
}
