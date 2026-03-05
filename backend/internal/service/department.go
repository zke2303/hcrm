package service

import (
	"context"
	"errors"
	"sort"

	"hcrm/backend/internal/model"
	"hcrm/backend/internal/repository"
	"hcrm/backend/internal/schema/vo"
)

// DepartmentService 科室业务接口
type DepartmentService interface {
	GetFullTree(ctx context.Context) ([]*vo.DepartmentTreeVO, error)
	GetStaffByDeptRecursive(ctx context.Context, deptID uint) ([]*vo.DepartmentStaffVO, error)
	UpdateHierarchy(ctx context.Context, id uint, parentID *uint) error
	AssignStaffToDepts(ctx context.Context, doctorID uint, deptIDs []uint) error
	RemoveStaffFromDept(ctx context.Context, doctorID uint, deptID uint) error
}

type departmentService struct {
	deptRepo   repository.DepartmentRepository
	doctorRepo repository.DoctorRepository
}

// NewDepartmentService 创建科室服务
func NewDepartmentService(
	deptRepo repository.DepartmentRepository,
	doctorRepo repository.DoctorRepository,
) DepartmentService {
	return &departmentService{
		deptRepo:   deptRepo,
		doctorRepo: doctorRepo,
	}
}

func (s *departmentService) GetFullTree(ctx context.Context) ([]*vo.DepartmentTreeVO, error) {
	depts, err := s.deptRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	return buildDeptTree(depts, nil), nil
}

func (s *departmentService) GetStaffByDeptRecursive(ctx context.Context, deptID uint) ([]*vo.DepartmentStaffVO, error) {
	// 1. 获取选定科室及其所有子科室 ID
	descendantIDs, err := s.deptRepo.FindDescendantIDs(ctx, deptID)
	if err != nil {
		return nil, err
	}

	// 2. 获取科室详情（用于获取名称和排序）
	allDepts, err := s.deptRepo.ListByIDs(ctx, descendantIDs)
	if err != nil {
		return nil, err
	}

	// 3. 获取这些科室下的所有医生
	deptDoctors, err := s.doctorRepo.FindInDepartments(ctx, descendantIDs)
	if err != nil {
		return nil, err
	}

	// 4. 按科室分组封装 VO
	var res []*vo.DepartmentStaffVO
	for _, id := range descendantIDs {
		dept, ok := allDepts[id]
		if !ok {
			continue
		}
		doctors := deptDoctors[id]
		// 如果该科室没有医生，展示空部门也是合理的，所以不跳过

		staffVOs := make([]vo.UserVO, 0, len(doctors))
		for _, d := range doctors {
			staffVOs = append(staffVOs, vo.UserVO{
				ID:         0, // 这里需要关联 User 信息，或者单独查询，为简化演示，此处暂缺 User 关联
				RealName:   d.RealName,
				Phone:      d.Phone,
				IsDoctor:   true,
				DoctorID:   &d.ID,
				Title:      d.Title,
				Specialty:  d.Specialty,
				EmployeeNo: d.EmployeeNo,
			})
		}

		res = append(res, &vo.DepartmentStaffVO{
			DepartmentID:   dept.ID,
			DepartmentName: dept.Name,
			Staff:          staffVOs,
		})
	}

	return res, nil
}

func (s *departmentService) UpdateHierarchy(ctx context.Context, id uint, parentID *uint) error {
	if parentID != nil && id == *parentID {
		return errors.New("不能将科室设置为自己的子科室")
	}

	dept, err := s.deptRepo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// 检查 parentID 是否是 id 的子孙节点
	if parentID != nil && *parentID != 0 {
		descendantIDs, err := s.deptRepo.FindDescendantIDs(ctx, id)
		if err != nil {
			return err
		}
		for _, dID := range descendantIDs {
			if dID == *parentID {
				return errors.New("不能将科室移动到其子科室下")
			}
		}
	}

	// 执行更新
	if parentID != nil && *parentID == 0 {
		dept.ParentID = nil
	} else {
		dept.ParentID = parentID
	}

	return s.deptRepo.Update(ctx, dept)
}

func (s *departmentService) AssignStaffToDepts(ctx context.Context, doctorID uint, deptIDs []uint) error {
	primaryDeptID := uint(0)
	if len(deptIDs) > 0 {
		primaryDeptID = deptIDs[0]
	}
	return s.doctorRepo.UpdateDepartments(ctx, doctorID, deptIDs, primaryDeptID)
}

func (s *departmentService) RemoveStaffFromDept(ctx context.Context, doctorID uint, deptID uint) error {
	return s.doctorRepo.RemoveFromDepartment(ctx, doctorID, deptID)
}

// buildDeptTree 构建科室树
func buildDeptTree(depts []*model.Department, parentID *uint) []*vo.DepartmentTreeVO {
	var tree []*vo.DepartmentTreeVO
	for _, d := range depts {
		if (parentID == nil && d.ParentID == nil) || (parentID != nil && d.ParentID != nil && *d.ParentID == *parentID) {
			node := &vo.DepartmentTreeVO{
				ID:       d.ID,
				Name:     d.Name,
				Type:     d.Type,
				ParentID: d.ParentID,
				Children: buildDeptTree(depts, &d.ID),
			}
			tree = append(tree, node)
		}
	}
	// 按 sortOrder 排序
	sort.Slice(tree, func(i, j int) bool {
		// 这里由于 depts 已经是按 sort_order 排序的，所以 tree 通常也是有序的，
		// 但为了保险可以再排一次（如果 buildDeptTree 逻辑改变的话）。
		return true
	})
	return tree
}
