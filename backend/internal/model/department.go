package model

// Department 科室表
type Department struct {
	Base
	ParentID    *uint      `gorm:"index;comment:上级科室ID" json:"parentId"`
	Code        string     `gorm:"size:30;unique;not null;comment:科室编码" json:"code"`
	Name        string     `gorm:"size:50;not null;comment:科室名称" json:"name"`
	Description string     `gorm:"size:200;comment:科室描述" json:"description"`
	ManagerID   *uint      `gorm:"index;comment:负责人ID" json:"managerId"`
	Phone       string     `gorm:"size:20;comment:科室联系电话" json:"phone"`
	SortOrder   int        `gorm:"not null;default:0;comment:排序" json:"sortOrder"`
	Status      int8       `gorm:"not null;default:1;comment:状态：0-禁用，1-启用" json:"status"`
	Level       int8       `gorm:"not null;default:1;comment:层级深度" json:"level"`
}

func (Department) TableName() string {
	return "departments"
}
