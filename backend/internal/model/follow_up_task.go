package model

import (
	"time"
)

// FollowUpTask 随访任务表
type FollowUpTask struct {
	Base
	TaskNo          string     `gorm:"size:20;unique;not null;comment:任务编号" json:"taskNo"`
	PatientID       uint       `gorm:"not null;index;comment:患者ID" json:"patientId"`
	TemplateID      uint       `gorm:"not null;index;comment:模板ID" json:"templateId"`
	RuleID          *uint      `gorm:"index;comment:规则ID" json:"ruleId"`
	QuestionnaireID *uint      `gorm:"index;comment:问卷ID" json:"questionnaireId"`
	DoctorID        *uint      `gorm:"index;comment:医生ID" json:"doctorId"`
	TaskType        int8       `gorm:"not null;default:1;comment:任务类型" json:"taskType"`
	PlanTime        time.Time  `gorm:"not null;index;comment:计划时间" json:"planTime"`
	ActualTime      *time.Time `json:"actualTime"`
	Status          int8       `gorm:"not null;default:1;index;comment:状态" json:"status"`
	ResultScore     *int       `json:"resultScore"`
	ResultData      string     `gorm:"type:json;comment:随访结果" json:"resultData"`
	FeedbackContent string     `gorm:"type:text;comment:反馈内容" json:"feedbackContent"`
	AlertLevel      int8       `gorm:"not null;default:0;index;comment:预警级别" json:"alertLevel"`
	AlertReason     string     `gorm:"size:200;comment:预警原因" json:"alertReason"`
	Remark          string     `gorm:"size:500;comment:备注" json:"remark"`
	CreatorID       *uint      `json:"creatorId"`
	CompletedAt     *time.Time `json:"completedAt"`
}

func (FollowUpTask) TableName() string {
	return "follow_up_tasks"
}
