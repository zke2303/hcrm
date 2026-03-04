package model

// FollowUpRule 随访规则表
type FollowUpRule struct {
	Base
	TemplateID            uint    `gorm:"not null;index;comment:关联模板ID" json:"templateId"`
	RuleName              string  `gorm:"size:50;not null;comment:规则名称" json:"ruleName"`
	TriggerEvent          int8    `gorm:"not null;default:1;index;comment:触发事件" json:"triggerEvent"`
	TriggerOffsetDays     int     `gorm:"not null;default:0;comment:触发偏移天数" json:"triggerOffsetDays"`
	TriggerTime           *string `gorm:"size:8;comment:触发时间点" json:"triggerTime"` // Using string for TIME type
	ConditionLogic        string  `gorm:"type:json;comment:执行条件" json:"conditionLogic"`
	ActionType            int8    `gorm:"not null;default:1;index;comment:触发动作" json:"actionType"`
	TargetQuestionnaireID *uint   `json:"targetQuestionnaireId"`
	Priority              int8    `gorm:"not null;default:1;comment:优先级" json:"priority"`
	SortOrder             int     `gorm:"not null;default:0;comment:排序" json:"sortOrder"`
	Status                int8    `gorm:"not null;default:1;index;comment:状态" json:"status"`
	CreatorID             *uint   `json:"creatorId"`
}

func (FollowUpRule) TableName() string {
	return "follow_up_rules"
}
