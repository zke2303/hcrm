package model

import (
	"time"
)

// OperationLog 操作日志表
type OperationLog struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	UserID        *uint          `gorm:"index;comment:操作人员ID" json:"userId"`
	Username      string         `gorm:"size:30;comment:操作人员账号" json:"username"`
	RealName      string         `gorm:"size:50;comment:操作人员姓名" json:"realName"`
	Action        string         `gorm:"size:50;not null;comment:操作动作" json:"action"`
	Module        string         `gorm:"size:50;not null;comment:目标模块" json:"module"`
	IPAddress     string         `gorm:"size:40;comment:IP地址" json:"ipAddress"`
	RequestMethod string         `gorm:"size:10;comment:请求方法" json:"requestMethod"`
	RequestURL    string         `gorm:"size:500;comment:请求URL" json:"requestUrl"`
	RequestParams string         `gorm:"type:json;comment:请求参数" json:"requestParams"`
	ResponseData  string         `gorm:"type:json;comment:响应数据" json:"responseData"`
	ExecutionTime int            `gorm:"comment:执行耗时(毫秒)" json:"executionTime"`
	Details       string         `gorm:"type:json;comment:操作详情" json:"details"`
	Status        int8           `gorm:"not null;default:1;comment:状态：0-失败，1-成功" json:"status"`
	ErrorMsg      string         `gorm:"type:text;comment:错误信息" json:"errorMsg"`
	CreatedAt     time.Time      `gorm:"index;comment:操作时间" json:"createdAt"`
}

func (OperationLog) TableName() string {
	return "operation_logs"
}
