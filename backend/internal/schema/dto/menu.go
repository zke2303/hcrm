package dto

type CreateMenuRequest struct {
	ParentID  uint   `json:"parentId"`
	Name      string `json:"name" binding:"required"`
	Type      int    `json:"type" binding:"required,oneof=1 2 3"`
	Path      string `json:"path"`
	Component string `json:"component"`
	Perms     string `json:"perms"`
	Icon      string `json:"icon"`
	SortOrder int    `json:"sortOrder"`
	Status    int8   `json:"status"`
	Visible   int8   `json:"visible"`
	ApiPath   string `json:"apiPath"`
}

type UpdateMenuRequest struct {
	ParentID  uint   `json:"parentId"`
	Name      string `json:"name"`
	Type      int    `json:"type"`
	Path      string `json:"path"`
	Component string `json:"component"`
	Perms     string `json:"perms"`
	Icon      string `json:"icon"`
	SortOrder int    `json:"sortOrder"`
	Status    int8   `json:"status"`
	Visible   int8   `json:"visible"`
	ApiPath   string `json:"apiPath"`
}

type ListMenuRequest struct {
	Name   string `form:"name"`
	Status *int8  `form:"status"`
}
