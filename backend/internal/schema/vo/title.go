package vo

// TitleVO 职称响应
type TitleVO struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	SortOrder int    `json:"sortOrder"`
}
