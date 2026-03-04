package model

import (
	"time"
)

// SysConfig 全局配置表
type SysConfig struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ConfigKey   string    `gorm:"size:50;unique;not null;comment:配置键" json:"configKey"`
	ConfigValue string    `gorm:"type:text;comment:配置值" json:"configValue"`
	Description string    `gorm:"size:200;comment:配置说明" json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

func (SysConfig) TableName() string {
	return "sys_configs"
}
