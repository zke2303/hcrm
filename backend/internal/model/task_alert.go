package model

import (
	"time"
)

// TaskAlert 任务异常预警表
type TaskAlert struct {
	Base
	TaskID           uint      `gorm:"not null;index;comment:任务ID" json:"taskId"`
	AlertType        int8      `gorm:"not null;default:1;comment:预警类型" json:"alertType"`
	AlertReason      string    `gorm:"size:200;not null;comment:原因描述" json:"alertReason"`
	AlertLevel       int8      `gorm:"not null;default:2;index;comment:级别" json:"alertLevel"`
	OriginalDoctorID *uint     `json:"originalDoctorId"`
	NewDoctorID      *uint     `json:"newDoctorId"`
	Status           int8      `gorm:"not null;default:1;index;comment:处理状态" json:"status"`
	HandlerID        *uint     `json:"handlerId"`
	HandleResult     string    `gorm:"type:text;comment:处理结果" json:"handleResult"`
	HandledAt        *time.Time `json:"handledAt"`
}

func (TaskAlert) TableName() string {
	return "task_alerts"
}
