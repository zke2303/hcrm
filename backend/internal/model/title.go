package model

import (
	"time"
)

// Title 职称字典表
type Title struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:50;unique;not null;comment:名称" json:"name"`
	Level     int8      `gorm:"not null;default:1;comment:等级" json:"level"`
	SortOrder int       `gorm:"not null;default:0;comment:排序" json:"sortOrder"`
	Status    int8      `gorm:"not null;default:1;comment:状态" json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (Title) TableName() string {
	return "titles"
}
