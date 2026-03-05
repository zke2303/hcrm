package converter

import (
	"hcrm/backend/internal/model"
	"hcrm/backend/internal/schema/vo"
)

func MenuToVO(menu *model.Menu) *vo.MenuVO {
	if menu == nil {
		return nil
	}
	return &vo.MenuVO{
		ID:        menu.ID,
		ParentID:  menu.ParentID,
		Name:      menu.Name,
		Type:      menu.Type,
		Path:      menu.Path,
		Component: menu.Component,
		Perms:     menu.Perms,
		Icon:      menu.Icon,
		SortOrder: menu.SortOrder,
		Status:    menu.Status,
		Visible:   menu.Visible,
		ApiPath:   menu.ApiPath,
		CreatedAt: menu.CreatedAt,
	}
}

func MenusToVOs(menus []*model.Menu) []*vo.MenuVO {
	res := make([]*vo.MenuVO, len(menus))
	for i, menu := range menus {
		res[i] = MenuToVO(menu)
	}
	return res
}

func BuildMenuTree(vos []*vo.MenuVO) []*vo.MenuVO {
	res := make([]*vo.MenuVO, 0)
	m := make(map[uint]*vo.MenuVO)

	for _, vo := range vos {
		m[vo.ID] = vo
	}

	for _, vo := range vos {
		if vo.ParentID == 0 {
			res = append(res, vo)
		} else {
			if parent, ok := m[vo.ParentID]; ok {
				parent.Children = append(parent.Children, vo)
			}
		}
	}
	return res
}
