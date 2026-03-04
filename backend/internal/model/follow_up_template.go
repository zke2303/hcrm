package model

import (
	"time"
)

// FollowUpTemplate 随访模板表
type FollowUpTemplate struct {
	Base
	Name          string     `gorm:"size:100;not null;comment:模板名称" json:"name"`
	DiseaseTypeID *uint      `gorm:"index;comment:病种分类ID" json:"diseaseTypeId"`
	DepartmentID  *uint      `gorm:"index;comment:所属科室ID" json:"departmentId"`
	Description   string     `gorm:"type:text;comment:描述" json:"description"`
	Version       string     `gorm:"size:10;not null;default:'1.0';comment:版本号" json:"version"`
	Status        int8       `gorm:"not null;default:1;index;comment:状态：1-草稿,2-发布,3-停用" json:"status"`
	IsBuiltin     int8       `gorm:"not null;default:0;index;comment:是否内置" json:"isBuiltin"`
	CreatorID     *uint      `json:"creatorId"`
	PublisherID   *uint      `json:"publisherId"`
	PublishedAt   *time.Time `json:"publishedAt"`
}

func (FollowUpTemplate) TableName() string {
	return "follow_up_templates"
}
