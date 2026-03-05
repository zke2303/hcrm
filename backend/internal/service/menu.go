package service

import (
	"context"
	"fmt"

	"hcrm/backend/internal/model"
	"hcrm/backend/internal/repository"
	"hcrm/backend/internal/schema/converter"
	"hcrm/backend/internal/schema/dto"
	"hcrm/backend/internal/schema/vo"
)

type MenuService interface {
	Create(ctx context.Context, req *dto.CreateMenuRequest) error
	Update(ctx context.Context, id uint, req *dto.UpdateMenuRequest) error
	Delete(ctx context.Context, id uint) error
	GetByID(ctx context.Context, id uint) (*vo.MenuVO, error)
	ListTree(ctx context.Context, req *dto.ListMenuRequest) ([]*vo.MenuVO, error)
}

type menuService struct {
	repo repository.MenuRepository
}

func NewMenuService(repo repository.MenuRepository) MenuService {
	return &menuService{repo: repo}
}

func (s *menuService) Create(ctx context.Context, req *dto.CreateMenuRequest) error {
	menu := &model.Menu{
		ParentID:  req.ParentID,
		Name:      req.Name,
		Type:      req.Type,
		Path:      req.Path,
		Component: req.Component,
		Perms:     req.Perms,
		Icon:      req.Icon,
		SortOrder: req.SortOrder,
		Status:    req.Status,
		Visible:   req.Visible,
		ApiPath:   req.ApiPath,
	}
	return s.repo.Create(ctx, menu)
}

func (s *menuService) Update(ctx context.Context, id uint, req *dto.UpdateMenuRequest) error {
	menu, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	menu.ParentID = req.ParentID
	menu.Name = req.Name
	menu.Type = req.Type
	menu.Path = req.Path
	menu.Component = req.Component
	menu.Perms = req.Perms
	menu.Icon = req.Icon
	menu.SortOrder = req.SortOrder
	menu.Status = req.Status
	menu.Visible = req.Visible
	menu.ApiPath = req.ApiPath
	return s.repo.Update(ctx, menu)
}

func (s *menuService) Delete(ctx context.Context, id uint) error {
	count, err := s.repo.GetChildrenCount(ctx, id)
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("存在子节点，禁止删除")
	}
	return s.repo.Delete(ctx, id)
}

func (s *menuService) GetByID(ctx context.Context, id uint) (*vo.MenuVO, error) {
	menu, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return converter.MenuToVO(menu), nil
}

func (s *menuService) ListTree(ctx context.Context, req *dto.ListMenuRequest) ([]*vo.MenuVO, error) {
	menus, err := s.repo.List(ctx, req.Name, req.Status)
	if err != nil {
		return nil, err
	}
	vos := converter.MenusToVOs(menus)
	return converter.BuildMenuTree(vos), nil
}
