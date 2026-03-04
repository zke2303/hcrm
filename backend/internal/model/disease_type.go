package model

// DiseaseType 病种分类表
type DiseaseType struct {
	Base
	ParentID    *uint  `gorm:"index;comment:上级分类ID" json:"parentId"`
	Code        string `gorm:"size:30;unique;not null;comment:编码" json:"code"`
	Name        string `gorm:"size:50;not null;comment:名称" json:"name"`
	Description string `gorm:"size:200;comment:描述" json:"description"`
	SortOrder   int    `gorm:"not null;default:0;comment:排序" json:"sortOrder"`
	Status      int8   `gorm:"not null;default:1;index;comment:状态" json:"status"`
}

func (DiseaseType) TableName() string {
	return "disease_types"
}
