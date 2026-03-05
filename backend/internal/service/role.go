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

type RoleService interface {
	Create(ctx context.Context, req *dto.CreateRoleRequest) error
	Update(ctx context.Context, id uint, req *dto.UpdateRoleRequest) error
	Delete(ctx context.Context, id uint) error
	GetByID(ctx context.Context, id uint) (*vo.RoleDetailVO, error)
	List(ctx context.Context, req *dto.ListRoleRequest) ([]*vo.RoleVO, int64, error)
	UpdateStatus(ctx context.Context, id uint, status int8) error
	UpdateMenus(ctx context.Context, id uint, menuIDs []uint) error
	UpdateDepts(ctx context.Context, id uint, deptIDs []uint) error
	Copy(ctx context.Context, id uint) (uint, error)
}

type roleService struct {
	repo repository.RoleRepository
}

func NewRoleService(repo repository.RoleRepository) RoleService {
	return &roleService{repo: repo}
}

func (s *roleService) Create(ctx context.Context, req *dto.CreateRoleRequest) error {
	role := &model.Role{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		DataScope:   req.DataScope,
		Status:      req.Status,
	}
	return s.repo.Create(ctx, role)
}

func (s *roleService) Update(ctx context.Context, id uint, req *dto.UpdateRoleRequest) error {
	role, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	role.Name = req.Name
	role.Code = req.Code
	role.Description = req.Description
	role.DataScope = req.DataScope
	role.Status = req.Status
	return s.repo.Update(ctx, role)
}

func (s *roleService) Delete(ctx context.Context, id uint) error {
	// 校验是否系统内置
	role, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if role.IsSystem == 1 {
		return fmt.Errorf("系统内置角色禁止删除")
	}
	return s.repo.Delete(ctx, id)
}

func (s *roleService) GetByID(ctx context.Context, id uint) (*vo.RoleDetailVO, error) {
	role, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	menuIDs, _ := s.repo.GetMenuIDsByRoleID(ctx, id)
	deptIDs, _ := s.repo.GetDeptIDsByRoleID(ctx, id)

	detail := &vo.RoleDetailVO{
		RoleVO:  *converter.RoleToVO(role),
		MenuIDs: menuIDs,
		DeptIDs: deptIDs,
	}
	return detail, nil
}

func (s *roleService) List(ctx context.Context, req *dto.ListRoleRequest) ([]*vo.RoleVO, int64, error) {
	roles, total, err := s.repo.List(ctx, req.Name, req.Status)
	if err != nil {
		return nil, 0, err
	}
	return converter.RolePtrListToVO(roles), total, nil
}

func (s *roleService) UpdateStatus(ctx context.Context, id uint, status int8) error {
	return s.repo.UpdateStatus(ctx, id, status)
}

func (s *roleService) UpdateMenus(ctx context.Context, id uint, menuIDs []uint) error {
	return s.repo.UpdateMenus(ctx, id, menuIDs)
}

func (s *roleService) UpdateDepts(ctx context.Context, id uint, deptIDs []uint) error {
	return s.repo.UpdateDepts(ctx, id, deptIDs)
}

func (s *roleService) Copy(ctx context.Context, id uint) (uint, error) {
	// 复制基本信息
	oldRole, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return 0, err
	}

	newRole := &model.Role{
		Name:        oldRole.Name + "_副本",
		Code:        oldRole.Code + "_copy",
		Description: oldRole.Description,
		DataScope:   oldRole.DataScope,
		Status:      1,
		IsSystem:    0,
	}

	var newID uint
	err = s.repo.Transaction(ctx, func(txCtx context.Context) error {
		if err := s.repo.Create(txCtx, newRole); err != nil {
			return err
		}
		newID = newRole.ID

		// 复制菜单
		menuIDs, _ := s.repo.GetMenuIDsByRoleID(txCtx, id)
		if len(menuIDs) > 0 {
			if err := s.repo.UpdateMenus(txCtx, newID, menuIDs); err != nil {
				return err
			}
		}

		// 复制科室范围
		deptIDs, _ := s.repo.GetDeptIDsByRoleID(txCtx, id)
		if len(deptIDs) > 0 {
			if err := s.repo.UpdateDepts(txCtx, newID, deptIDs); err != nil {
				return err
			}
		}

		return nil
	})

	return newID, err
}
