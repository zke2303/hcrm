package model

// PatientGroup 患者分组表
type PatientGroup struct {
	Base
	Name        string `gorm:"size:100;not null;comment:分组名称" json:"name"`
	GroupType   int8   `gorm:"not null;default:1;index;comment:类型：1-静态,2-动态" json:"groupType"`
	Description string `gorm:"size:500;comment:描述" json:"description"`
	RuleContent string `gorm:"type:json;comment:规则内容" json:"ruleContent"`
	MemberCount int    `gorm:"not null;default:0;comment:成员数量" json:"memberCount"`
	CreatorID   *uint  `json:"creatorId"`
}

func (PatientGroup) TableName() string {
	return "patient_groups"
}
