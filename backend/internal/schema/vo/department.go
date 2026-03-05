package vo

// DepartmentVO 科室简要信息
type DepartmentVO struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

// DepartmentStaffVO 按科室分组的人员列表
type DepartmentStaffVO struct {
	DepartmentID   uint     `json:"departmentId"`
	DepartmentName string   `json:"departmentName"`
	Staff          []UserVO `json:"staff"`
}

// DepartmentTreeVO 组织架构树节点
type DepartmentTreeVO struct {
	ID       uint                `json:"id"`
	Name     string              `json:"name"`
	Type     int8                `json:"type"` // 1-医院, 2-科室
	ParentID *uint               `json:"parentId"`
	Children []*DepartmentTreeVO `json:"children"`
}
