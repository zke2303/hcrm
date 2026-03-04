package model

import (
	"time"
)

// User 系统用户表
type User struct {
	Base
	Username     string     `gorm:"size:30;unique;not null;comment:登录账号" json:"username"`
	PasswordHash string     `gorm:"size:255;not null;comment:密码哈希" json:"-"`
	RealName     string     `gorm:"size:50;not null;comment:真实姓名" json:"realName"`
	Phone        string     `gorm:"size:11;unique;not null;comment:手机号" json:"phone"`
	Email        string     `gorm:"size:100;comment:邮箱" json:"email"`
	EmployeeNo   string     `gorm:"size:30;comment:工号" json:"employeeNo"`
	DepartmentID *uint      `gorm:"index;comment:所属科室ID" json:"departmentId"`
	Remark       string     `gorm:"size:200;comment:备注" json:"remark"`
	Status       int8       `gorm:"not null;default:1;comment:状态：0-禁用，1-启用" json:"status"`
	LastLoginAt  *time.Time `json:"lastLoginAt"`
	LastLoginIP  string     `gorm:"size:40;comment:最后登录IP" json:"lastLoginIp"`
	CreatorID    *uint      `json:"creatorId"`
}

func (User) TableName() string {
	return "users"
}
