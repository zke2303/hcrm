package model

import (
	"time"
)

// TaskReassignment 任务重新分配记录表
type TaskReassignment struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	TaskID       uint      `gorm:"not null;index;comment:任务ID" json:"taskId"`
	FromDoctorID uint      `gorm:"not null;index;comment:原医生ID" json:"fromDoctorId"`
	ToDoctorID   uint      `gorm:"not null;index;comment:新医生ID" json:"toDoctorId"`
	Reason       string    `gorm:"size:200;comment:重新分配原因" json:"reason"`
	OperatorID   uint      `gorm:"not null;comment:操作人ID" json:"operatorId"`
	CreatedAt    time.Time `json:"createdAt"`
}

func (TaskReassignment) TableName() string {
	return "task_reassignments"
}
