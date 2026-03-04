package dto

// PaginationRequest 基础分页请求
type PaginationRequest struct {
	Page     int `json:"page" form:"page,default=1" binding:"gte=1"`
	PageSize int `json:"pageSize" form:"pageSize,default=10" binding:"gte=1,lte=100"`
}
