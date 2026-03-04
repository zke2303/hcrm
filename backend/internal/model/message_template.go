package model

// MessageTemplate 短信/消息模板表
type MessageTemplate struct {
	Base
	Code           string `gorm:"size:50;unique;not null;index;comment:模板编码" json:"code"`
	Name           string `gorm:"size:50;not null;comment:模板名称" json:"name"`
	Content        string `gorm:"type:text;not null;comment:模板内容" json:"content"`
	Channel        int8   `gorm:"not null;default:1;index;comment:渠道" json:"channel"`
	TemplateType   int8   `gorm:"not null;default:1;index;comment:类型" json:"templateType"`
	Variables      string `gorm:"type:json;comment:变量定义" json:"variables"`
	AuditStatus    int8   `gorm:"not null;default:1;index;comment:审核状态" json:"auditStatus"`
	AuditRemark    string `gorm:"size:200;comment:审核备注" json:"auditRemark"`
	ThirdPartyCode string `gorm:"size:50;comment:第三方平台编码" json:"thirdPartyCode"`
	Description    string `gorm:"size:200;comment:说明" json:"description"`
	Status         int8   `gorm:"not null;default:1;comment:状态" json:"status"`
	CreatorID      *uint  `json:"creatorId"`
}

func (MessageTemplate) TableName() string {
	return "message_templates"
}
