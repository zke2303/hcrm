package vo

// PageResponse 分页响应包装
type PageResponse struct {
	Total int64       `json:"total"`
	List  interface{} `json:"list"`
}
