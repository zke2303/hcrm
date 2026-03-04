package model

// SurgeryType 手术类型表
type SurgeryType struct {
	Base
	DiseaseTypeID uint   `gorm:"uniqueIndex:uk_disease_surgery;not null;index;comment:所属病种ID" json:"diseaseTypeId"`
	Code          string `gorm:"size:30;uniqueIndex:uk_disease_surgery;not null;comment:编码" json:"code"`
	Name          string `gorm:"size:50;not null;comment:名称" json:"name"`
	Description   string `gorm:"size:200;comment:描述" json:"description"`
	SortOrder     int    `gorm:"not null;default:0;comment:排序" json:"sortOrder"`
	Status        int8   `gorm:"not null;default:1;index;comment:状态" json:"status"`
}

func (SurgeryType) TableName() string {
	return "surgery_types"
}
