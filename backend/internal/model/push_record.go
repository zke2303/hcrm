package model

import (
	"time"
)

// PushRecord 推送记录日志表
type PushRecord struct {
	Base
	TemplateID      uint       `gorm:"not null;index;comment:模板ID" json:"templateId"`
	BusinessType    int8       `gorm:"not null;default:1;index;comment:业务类型" json:"businessType"`
	BusinessID      *uint      `json:"businessId"`
	ReceiverType    int8       `gorm:"not null;default:1;comment:接收者类型" json:"receiverType"`
	ReceiverID      uint       `gorm:"not null;index;comment:接收者ID" json:"receiverId"`
	ReceiverName    string     `gorm:"size:50;comment:接收者姓名" json:"receiverName"`
	ReceiverContact string     `gorm:"size:50;not null;comment:接收联系方式" json:"receiverContact"`
	Content         string     `gorm:"type:text;not null;comment:实际内容" json:"content"`
	Channel         int8       `gorm:"not null;default:1;comment:渠道" json:"channel"`
	SendStatus      int8       `gorm:"not null;default:1;index;comment:发送状态" json:"sendStatus"`
	SendTime        *time.Time `json:"sendTime"`
	ReceiveStatus   *int8      `json:"receiveStatus"`
	ReceiveTime     *time.Time `json:"receiveTime"`
	IsRead          int8       `gorm:"not null;default:0;comment:是否已读" json:"isRead"`
	ReadTime        *time.Time `json:"readTime"`
	FailReason      string     `gorm:"type:text;comment:失败原因" json:"failReason"`
	ThirdPartyMsgID string     `gorm:"size:64;comment:第三方消息ID" json:"thirdPartyMsgId"`
	RetryCount      int        `gorm:"not null;default:0;comment:重试次数" json:"retryCount"`
}

func (PushRecord) TableName() string {
	return "push_records"
}
