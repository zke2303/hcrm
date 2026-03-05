package model

// Doctor 医生/员工档案表
type Doctor struct {
	Base
	UserID       *uint      `gorm:"unique;index;comment:关联的用户ID" json:"userId"`
	RealName     string     `gorm:"size:50;not null;comment:真实姓名" json:"realName"`
	Phone        string     `gorm:"size:11;unique;not null;comment:手机号" json:"phone"`
	Title        string     `gorm:"size:50;comment:职称" json:"title"`
	Specialty    string     `gorm:"size:200;comment:擅长领域" json:"specialty"`
	Introduction string     `gorm:"type:text;comment:简介" json:"introduction"`
	AvatarURL    string     `gorm:"size:255;comment:头像URL" json:"avatarUrl"`
	EmployeeNo   string     `gorm:"size:30;comment:工号" json:"employeeNo"`
	Status       int8       `gorm:"not null;default:1;comment:状态：0-离职，1-在职" json:"status"`
	CreatorID    *uint      `json:"creatorId"`
}

func (Doctor) TableName() string {
	return "doctors"
}
