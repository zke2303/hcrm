package model

const (
	OrgTypeHospital   int8 = 1 // 医院
	OrgTypeDepartment int8 = 2 // 科室
)

// Department 科室/组织表
type Department struct {
	Base
	ParentID    *uint  `gorm:"index;comment:上级ID" json:"parentId"`
	Code        string `gorm:"size:30;unique;not null;comment:编码" json:"code"`
	Name        string `gorm:"size:50;not null;comment:名称" json:"name"`
	Type        int8   `gorm:"not null;default:2;comment:类型：1-医院，2-科室" json:"type"`
	Description string `gorm:"size:200;comment:描述" json:"description"`
	ManagerID   *uint  `gorm:"index;comment:负责人ID" json:"managerId"`
	Phone       string `gorm:"size:20;comment:联系电话" json:"phone"`
	SortOrder   int    `gorm:"not null;default:0;comment:排序" json:"sortOrder"`
	Status      int8   `gorm:"not null;default:1;comment:状态：0-禁用，1-启用" json:"status"`
	Level       int8   `gorm:"not null;default:1;comment:层级深度" json:"level"`
}

func (Department) TableName() string {
	return "departments"
}
