package model

import (
	"time"
)

// Patient 患者基础信息表
type Patient struct {
	Base
	PatientNo         string     `gorm:"size:20;unique;not null;comment:病案号" json:"patientNo"`
	Name              string     `gorm:"size:20;not null;comment:姓名" json:"name"`
	IDCard            string     `gorm:"size:18;unique;not null;comment:身份证号" json:"idCard"`
	Gender            int8       `gorm:"not null;default:0;comment:性别：0-未知,1-男,2-女" json:"gender"`
	Birthday          *time.Time `json:"birthday"`
	Age               int        `json:"age"`
	Phone             string     `gorm:"size:11;not null;comment:手机号" json:"phone"`
	BackupPhone       string     `gorm:"size:11;comment:备用手机号" json:"backupPhone"`
	DiseaseTypeID     *uint      `gorm:"index;comment:主诊断病种ID" json:"diseaseTypeId"`
	SurgeryTypeID     *uint      `gorm:"index;comment:手术类型ID" json:"surgeryTypeId"`
	SurgeryTime       *time.Time `gorm:"index;comment:手术时间" json:"surgeryTime"`
	AdmissionNo       string     `gorm:"size:20;comment:住院号" json:"admissionNo"`
	AttendingDoctorID *uint      `gorm:"index;comment:主管医生ID" json:"attendingDoctorId"`
	Source            int8       `gorm:"not null;default:3;index;comment:来源：1-HIS,2-导入,3-手动" json:"source"`
	Address           string     `gorm:"size:200;comment:家庭住址" json:"address"`
	AllergyHistory    string     `gorm:"type:text;comment:过敏史" json:"allergyHistory"`
	EmergencyContact  string     `gorm:"size:20;comment:紧急联系人" json:"emergencyContact"`
	EmergencyPhone    string     `gorm:"size:11;comment:紧急联系人电话" json:"emergencyPhone"`
	CreatorID         *uint      `gorm:"index;comment:建档人ID" json:"creatorId"`
}

func (Patient) TableName() string {
	return "patients"
}
