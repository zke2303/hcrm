package model

import (
	"time"
)

// GroupMember 静态分组成员表
type GroupMember struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	GroupID   uint      `gorm:"uniqueIndex:uk_group_patient;not null;comment:分组ID" json:"groupId"`
	PatientID uint      `gorm:"uniqueIndex:uk_group_patient;not null;comment:患者ID" json:"patientId"`
	CreatedAt time.Time `json:"createdAt"`
}

func (GroupMember) TableName() string {
	return "group_members"
}
