package model

import (
	"time"
)

// Notice 通知公告表
type Notice struct {
	Base
	Title            string     `gorm:"size:100;not null;comment:标题" json:"title"`
	Content          string     `gorm:"type:text;not null;comment:内容" json:"content"`
	NoticeType       int8       `gorm:"not null;default:1;comment:类型" json:"noticeType"`
	PublishScopeType int8       `gorm:"not null;default:1;index;comment:发布范围类型" json:"publishScopeType"`
	PublishScope     string     `gorm:"type:json;comment:发布范围" json:"publishScope"`
	AttachmentURL    string     `gorm:"size:255;comment:附件URL" json:"attachmentUrl"`
	IsTop            int8       `gorm:"not null;default:0;index;comment:是否置顶" json:"isTop"`
	TopExpireAt      *time.Time `json:"topExpireAt"`
	ViewCount        int        `gorm:"not null;default:0;comment:浏览次数" json:"viewCount"`
	PublisherID      uint       `gorm:"not null;comment:发布人ID" json:"publisherId"`
	PublishTime      *time.Time `gorm:"index;comment:发布时间" json:"publishTime"`
	Status           int8       `gorm:"not null;default:1;index;comment:状态" json:"status"`
}

func (Notice) TableName() string {
	return "notices"
}
