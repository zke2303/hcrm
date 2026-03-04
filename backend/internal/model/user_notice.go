package model

import (
	"time"
)

// UserNotice 用户通知阅读记录表
type UserNotice struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	NoticeID  uint      `gorm:"uniqueIndex:uk_notice_user;not null;index;comment:公告ID" json:"noticeId"`
	UserID    uint      `gorm:"uniqueIndex:uk_notice_user;not null;index;comment:用户ID" json:"userId"`
	IsRead    int8      `gorm:"not null;default:0;comment:是否已读" json:"isRead"`
	ReadAt    *time.Time `json:"readAt"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (UserNotice) TableName() string {
	return "user_notices"
}
