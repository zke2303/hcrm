package vo

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse 登录成功响应
type LoginResponse struct {
	AccessToken  string   `json:"accessToken"`
	RefreshToken string   `json:"-"` // 不在 JSON 中直接返回，由开发组件控制 Cookie
	User         UserInfo `json:"user"`
}

// UserInfo 登录成功返回的用户信息
type UserInfo struct {
	ID                 uint      `json:"id"`
	Username           string    `json:"username"`
	RealName           string    `json:"realName"`
	Phone              string    `json:"phone"`
	Roles              []string  `json:"roles"`
	Permissions        []string  `json:"permissions"`
	Menus              []*MenuVO `json:"menus"`
	DoctorID           *uint     `json:"doctorId,omitempty"`
	DepartmentID       *uint     `json:"departmentId,omitempty"`
	MustChangePassword bool      `json:"mustChangePassword"`
}

// TokenRefreshResponse 令牌刷新响应
type TokenRefreshResponse struct {
	AccessToken string `json:"accessToken"`
}
