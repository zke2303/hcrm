package model

// Questionnaire 问卷/量表设计表
type Questionnaire struct {
	Base
	TemplateID    uint   `gorm:"not null;index;comment:关联模板ID" json:"templateId"`
	Title         string `gorm:"size:100;not null;comment:问卷标题" json:"title"`
	Subtitle      string `gorm:"size:200;comment:副标题" json:"subtitle"`
	FormSchema    string `gorm:"type:json;not null;comment:表单定义" json:"formSchema"`
	TotalScore    *int   `json:"totalScore"`
	EstimatedTime *int   `json:"estimatedTime"`
	SortOrder     int    `gorm:"not null;default:0;comment:排序" json:"sortOrder"`
	Status        int8   `gorm:"not null;default:1;index;comment:状态" json:"status"`
	CreatorID     *uint  `json:"creatorId"`
}

func (Questionnaire) TableName() string {
	return "questionnaires"
}
