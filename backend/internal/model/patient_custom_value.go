package model

import (
	"time"
)

// PatientCustomValue 患者自定义字段值表
type PatientCustomValue struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	PatientID  uint      `gorm:"uniqueIndex:uk_patient_field;not null;comment:患者ID" json:"patientId"`
	FieldID    uint      `gorm:"uniqueIndex:uk_patient_field;not null;comment:字段ID" json:"fieldId"`
	FieldValue string    `gorm:"type:text;comment:字段值" json:"fieldValue"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

func (PatientCustomValue) TableName() string {
	return "patient_custom_values"
}
