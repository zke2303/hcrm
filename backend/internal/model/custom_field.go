package model

// CustomField 自定义字段定义表
type CustomField struct {
	Base
	ModuleType        int8   `gorm:"not null;default:1;index;comment:模块：1-患者,2-随访" json:"moduleType"`
	FieldName         string `gorm:"size:50;not null;index;comment:字段英文标识" json:"fieldName"`
	FieldLabel        string `gorm:"size:50;not null;comment:展示名称" json:"fieldLabel"`
	FieldType         int8   `gorm:"not null;default:1;comment:类型：1-文本,2-数字,3-日期,4-单选,5-多选,6-布尔" json:"fieldType"`
	FieldOptions      string `gorm:"type:json;comment:选项配置" json:"fieldOptions"`
	IsRequired        int8   `gorm:"not null;default:0;comment:是否必填" json:"isRequired"`
	SortOrder         int    `gorm:"not null;default:0;comment:排序" json:"sortOrder"`
	IsVisibleDoctor   int8   `gorm:"not null;default:1;comment:医生端可见" json:"isVisibleDoctor"`
	IsEditableDoctor  int8   `gorm:"not null;default:1;comment:医生端可编辑" json:"isEditableDoctor"`
	IsVisiblePatient  int8   `gorm:"not null;default:0;comment:患者端可见" json:"isVisiblePatient"`
	IsEditablePatient int8   `gorm:"not null;default:0;comment:患者端可编辑" json:"isEditablePatient"`
	Status            int8   `gorm:"not null;default:1;index;comment:状态" json:"status"`
	CreatorID         *uint  `json:"creatorId"`
}

func (CustomField) TableName() string {
	return "custom_fields"
}
