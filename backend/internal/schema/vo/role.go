package vo

import "time"

type RoleVO struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Code        string    `json:"code"`
	Description string    `json:"description"`
	DataScope   int       `json:"dataScope"`
	Status      int8      `json:"status"`
	IsSystem    int8      `json:"isSystem"`
	CreatedAt   time.Time `json:"createdAt"`
}

type RoleDetailVO struct {
	RoleVO
	MenuIDs []uint `json:"menuIds"`
	DeptIDs []uint `json:"deptIds"`
}
