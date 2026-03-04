package errors

import (
	"fmt"
	"net/http"
)

// Error 业务错误结构
type Error struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// Error 实现 error 接口
func (e *Error) Error() string {
	return fmt.Sprintf("[%d] %s", e.Code, e.Message)
}

// NewError 创建业务错误
func NewError(code int, message string) *Error {
	return &Error{
		Code:    code,
		Message: message,
	}
}

// WithMessage 添加消息
func (e *Error) WithMessage(msg string) *Error {
	return &Error{
		Code:    e.Code,
		Message: msg,
	}
}

// WithError 基于原始错误添加消息
func (e *Error) WithError(err error) *Error {
	return &Error{
		Code:    e.Code,
		Message: fmt.Sprintf("%s: %v", e.Message, err),
	}
}

// HTTPStatus 返回 HTTP 状态码
func (e *Error) HTTPStatus() int {
	// 根据错误码范围判断 HTTP 状态码
	switch {
	case e.Code >= 10000 && e.Code < 20000:
		return http.StatusBadRequest
	case e.Code >= 20000 && e.Code < 30000:
		return http.StatusUnauthorized
	case e.Code >= 30000 && e.Code < 40000:
		return http.StatusForbidden
	case e.Code >= 40000 && e.Code < 50000:
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

// 通用错误定义
var (
	ErrBadRequest         = NewError(10001, "请求参数错误")
	ErrUnauthorized       = NewError(20001, "未授权访问")
	ErrForbidden          = NewError(30001, "禁止访问")
	ErrNotFound           = NewError(40001, "资源不存在")
	ErrInternal           = NewError(50001, "服务器内部错误")
	ErrDatabase           = NewError(50002, "数据库错误")
	ErrServiceUnavailable = NewError(50003, "服务暂不可用")

	// 用户管理模块 (11000-11999)
	ErrUserNotFound       = NewError(11010, "用户不存在")
	ErrUserExists         = NewError(11020, "用户账号已存在")
	ErrPhoneExists        = NewError(11030, "手机号已被占用")
	ErrDepartmentNotFound = NewError(11040, "所属科室不存在")
	ErrInvalidPassword    = NewError(11050, "密码不合法")
	ErrSelfAction         = NewError(11060, "不能对自己进行此项操作")
)
