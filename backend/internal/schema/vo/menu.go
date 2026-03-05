package vo

import "time"

type MenuVO struct {
	ID        uint      `json:"id"`
	ParentID  uint      `json:"parentId"`
	Name      string    `json:"name"`
	Type      int       `json:"type"`
	Path      string    `json:"path"`
	Component string    `json:"component"`
	Perms     string    `json:"perms"`
	Icon      string    `json:"icon"`
	SortOrder int       `json:"sortOrder"`
	Status    int8      `json:"status"`
	Visible   int8      `json:"visible"`
	ApiPath   string    `json:"apiPath"`
	CreatedAt time.Time `json:"createdAt"`
	Children  []*MenuVO `json:"children,omitempty"`
}
