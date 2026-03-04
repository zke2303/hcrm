package model

import (
	"time"

	"gorm.io/gorm"
)

// Base 基础模型，包含通用字段
type Base struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 返回表名（子结构体应覆盖此方法）
func (Base) TableName() string {
	return ""
}