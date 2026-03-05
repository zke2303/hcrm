package converter

import (
	"hcrm/backend/internal/model"
	"hcrm/backend/internal/schema/vo"
)

func RoleToVO(role *model.Role) *vo.RoleVO {
	if role == nil {
		return nil
	}
	return &vo.RoleVO{
		ID:          role.ID,
		Name:        role.Name,
		Code:        role.Code,
		Description: role.Description,
		DataScope:   role.DataScope,
		Status:      role.Status,
		IsSystem:    role.IsSystem,
		CreatedAt:   role.CreatedAt,
	}
}

func RoleListToVO(roles []model.Role) []*vo.RoleVO {
	res := make([]*vo.RoleVO, len(roles))
	for i, role := range roles {
		res[i] = RoleToVO(&role)
	}
	return res
}

func RolePtrListToVO(roles []*model.Role) []*vo.RoleVO {
	res := make([]*vo.RoleVO, len(roles))
	for i, role := range roles {
		res[i] = RoleToVO(role)
	}
	return res
}
