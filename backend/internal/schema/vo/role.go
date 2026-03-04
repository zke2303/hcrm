package vo

import "time"

// RoleVO 角色响应对象
type RoleVO struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsSystem    int8      `json:"isSystem"`
	CreatedAt   time.Time `json:"createdAt"`
}
