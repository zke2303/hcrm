package converter

import (
	"hcrm/backend/internal/model"
	"hcrm/backend/internal/schema/vo"
)

// RoleToVO 角色实体转为 VO
func RoleToVO(m *model.Role) *vo.RoleVO {
	if m == nil {
		return nil
	}
	return &vo.RoleVO{
		ID:          m.ID,
		Name:        m.Name,
		Description: m.Description,
		IsSystem:    m.IsSystem,
		CreatedAt:   m.CreatedAt,
	}
}

// RoleListToVO 角色列表实体转为 VO 列表
func RoleListToVO(list []model.Role) []*vo.RoleVO {
	res := make([]*vo.RoleVO, len(list))
	for i, m := range list {
		res[i] = RoleToVO(&m)
	}
	return res
}
