// Package service 业务逻辑层实现
package service

import (
	"context"
	"errors" // standard library errors
	"fmt"
	"strconv"
	"strings"

	"golang.org/x/crypto/bcrypt"

	apperrors "hcrm/backend/internal/errors"
	"hcrm/backend/internal/model"
	"hcrm/backend/internal/repository"
	"hcrm/backend/internal/schema/converter"
	"hcrm/backend/internal/schema/dto"
	"hcrm/backend/internal/schema/vo"
)

// UserService 用户服务接口
type UserService interface {
	Create(ctx context.Context, req *dto.CreateUserRequest) (*vo.CreateUserResponse, error)
	Update(ctx context.Context, id uint, req *dto.UpdateUserRequest) error
	Delete(ctx context.Context, id uint) error
	GetByID(ctx context.Context, id uint) (*vo.UserVO, error)
	List(ctx context.Context, req *dto.ListUserRequest) (*vo.PageResponse, error)
	UpdateStatus(ctx context.Context, id uint, status int8) error
	ResetPassword(ctx context.Context, id uint, password string) error
	ChangePassword(ctx context.Context, userID uint, req *dto.ChangePasswordRequest) error
	ListRoles(ctx context.Context) ([]*vo.RoleVO, error)
	ListTitles(ctx context.Context) ([]*vo.TitleVO, error)
	ListDepartments(ctx context.Context) ([]*vo.DepartmentVO, error)
}

type userService struct {
	userRepo   repository.UserRepository
	doctorRepo repository.DoctorRepository
	deptRepo   repository.DepartmentRepository
	titleRepo  repository.TitleRepository
}

// NewUserService 创建用户服务
func NewUserService(
	userRepo repository.UserRepository,
	doctorRepo repository.DoctorRepository,
	deptRepo repository.DepartmentRepository,
	titleRepo repository.TitleRepository,
) UserService {
	return &userService{
		userRepo:   userRepo,
		doctorRepo: doctorRepo,
		deptRepo:   deptRepo,
		titleRepo:  titleRepo,
	}
}

func (s *userService) Create(ctx context.Context, req *dto.CreateUserRequest) (*vo.CreateUserResponse, error) {
	// 校验账号是否已存在
	if _, err := s.userRepo.GetByUsername(ctx, req.Username); err == nil {
		return nil, apperrors.ErrUserExists
	}

	// 校验手机号是否已存在
	if _, err := s.userRepo.GetByPhone(ctx, req.Phone); err == nil {
		return nil, apperrors.ErrPhoneExists
	}

	// 校验科室是否存在
	if req.DepartmentID != nil {
		if _, err := s.deptRepo.GetByID(ctx, *req.DepartmentID); err != nil {
			return nil, apperrors.ErrDepartmentNotFound
		}
	}

	// 自动生成工号（EMP + 5位数字）
	employeeNo, err := s.generateEmployeeNo(ctx)
	if err != nil {
		return nil, apperrors.ErrInternal.WithError(err)
	}

	// 使用默认密码
	const defaultPassword = "123456"
	hashed, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, apperrors.ErrInternal.WithError(err)
	}

	user := &model.User{
		Username:           req.Username,
		PasswordHash:       string(hashed),
		RealName:           req.RealName,
		Phone:              req.Phone,
		Email:              req.Email,
		EmployeeNo:         employeeNo,
		DepartmentID:       req.DepartmentID,
		Remark:             req.Remark,
		Status:             1,
		MustChangePassword: true,
	}

	err = s.userRepo.Transaction(ctx, func(txCtx context.Context) error {
		// 1. 创建用户
		if err := s.userRepo.Create(txCtx, user); err != nil {
			return err
		}

		// 2. 关联角色
		if len(req.RoleIDs) > 0 {
			if err := s.userRepo.UpdateRoles(txCtx, user.ID, req.RoleIDs); err != nil {
				return err
			}
		}

		// 3. 联动创建医生档案
		if req.IsDoctor {
			doctor := &model.Doctor{
				UserID:       &user.ID,
				RealName:     user.RealName,
				Phone:        user.Phone,
				DepartmentID: 0, // 默认或从 req 获取
				Title:        req.Title,
				Specialty:    req.Specialty,
				Introduction: req.Introduction,
				EmployeeNo:   user.EmployeeNo,
				Status:       1,
			}
			if user.DepartmentID != nil {
				doctor.DepartmentID = *user.DepartmentID
			}
			if err := s.doctorRepo.Create(txCtx, doctor); err != nil {
				return err
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return &vo.CreateUserResponse{
		ID:              user.ID,
		Username:        user.Username,
		EmployeeNo:      employeeNo,
		DefaultPassword: defaultPassword,
	}, nil
}

func (s *userService) Update(ctx context.Context, id uint, req *dto.UpdateUserRequest) error {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return apperrors.ErrUserNotFound
	}

	// 校验手机号冲突
	if user.Phone != req.Phone {
		if _, err := s.userRepo.GetByPhone(ctx, req.Phone); err == nil {
			return apperrors.ErrPhoneExists
		}
	}

	// 校验科室
	if req.DepartmentID != nil {
		if _, err := s.deptRepo.GetByID(ctx, *req.DepartmentID); err != nil {
			return apperrors.ErrDepartmentNotFound
		}
	}

	user.RealName = req.RealName
	user.Phone = req.Phone
	user.Email = req.Email
	user.EmployeeNo = req.EmployeeNo
	user.DepartmentID = req.DepartmentID
	user.Remark = req.Remark
	if req.Status != nil {
		user.Status = *req.Status
	}

	return s.userRepo.Transaction(ctx, func(txCtx context.Context) error {
		// 1. 更新用户
		if err := s.userRepo.Update(txCtx, user); err != nil {
			return err
		}

		// 2. 更新角色
		if req.RoleIDs != nil {
			if err := s.userRepo.UpdateRoles(txCtx, user.ID, *req.RoleIDs); err != nil {
				return err
			}
		}

		// 3. 联动更新医生档案
		if req.IsDoctor != nil {
			doctor, err := s.doctorRepo.GetByUserID(txCtx, user.ID)
			if err != nil {
				return err
			}

			if *req.IsDoctor {
				if doctor == nil {
					doctor = &model.Doctor{
						UserID: &user.ID,
					}
				}
				doctor.RealName = user.RealName
				doctor.Phone = user.Phone
				doctor.EmployeeNo = user.EmployeeNo
				doctor.Title = req.Title
				doctor.Specialty = req.Specialty
				doctor.Introduction = req.Introduction
				if user.DepartmentID != nil {
					doctor.DepartmentID = *user.DepartmentID
				}

				if doctor.ID == 0 {
					if err := s.doctorRepo.Create(txCtx, doctor); err != nil {
						return err
					}
				} else {
					if err := s.doctorRepo.Update(txCtx, doctor); err != nil {
						return err
					}
				}
			}
		}

		return nil
	})
}

func (s *userService) Delete(ctx context.Context, id uint) error {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return apperrors.ErrUserNotFound
	}
	// 禁止删除内置管理员
	if user.ID == 1 || user.Username == "admin" {
		return apperrors.ErrAdminDelete
	}
	return s.userRepo.Delete(ctx, id)
}

func (s *userService) GetByID(ctx context.Context, id uint) (*vo.UserVO, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, apperrors.ErrUserNotFound
	}

	var dept *model.Department
	if user.DepartmentID != nil {
		dept, _ = s.deptRepo.GetByID(ctx, *user.DepartmentID)
	}

	roles, _ := s.userRepo.GetRoles(ctx, user.ID)
	doctor, _ := s.doctorRepo.GetByUserID(ctx, user.ID)

	return converter.UserToVO(user, dept, roles, doctor), nil
}

func (s *userService) List(ctx context.Context, req *dto.ListUserRequest) (*vo.PageResponse, error) {
	users, total, err := s.userRepo.List(ctx, req)
	if err != nil {
		return nil, apperrors.ErrDatabase.WithError(err)
	}

	// 批量获取科室名称
	deptIDs := make([]uint, 0)
	for _, u := range users {
		if u.DepartmentID != nil {
			deptIDs = append(deptIDs, *u.DepartmentID)
		}
	}
	depts, _ := s.deptRepo.ListByIDs(ctx, deptIDs)

	// 批量获取角色
	userIDs := make([]uint, 0)
	for _, u := range users {
		userIDs = append(userIDs, u.ID)
	}
	rolesMap, _ := s.userRepo.ListRolesByUserIDs(ctx, userIDs)

	return &vo.PageResponse{
		Total: total,
		List:  converter.UserListToVO(users, depts, rolesMap),
	}, nil
}

func (s *userService) UpdateStatus(ctx context.Context, id uint, status int8) error {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return apperrors.ErrUserNotFound
	}
	// 禁止禁用内置管理员
	if (user.ID == 1 || user.Username == "admin") && status == 0 {
		return apperrors.ErrAdminDelete.WithMessage("系统内置管理员账号禁止禁用")
	}
	return s.userRepo.UpdateStatus(ctx, id, status)
}

func (s *userService) ResetPassword(ctx context.Context, id uint, password string) error {
	_, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return apperrors.ErrUserNotFound
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return apperrors.ErrInternal.WithError(err)
	}

	return s.userRepo.ResetPassword(ctx, id, string(hashed))
}

func (s *userService) ListRoles(ctx context.Context) ([]*vo.RoleVO, error) {
	roles, err := s.userRepo.FindAllRoles(ctx)
	if err != nil {
		return nil, apperrors.ErrDatabase.WithError(err)
	}

	return converter.RoleListToVO(roles), nil
}

func (s *userService) ListTitles(ctx context.Context) ([]*vo.TitleVO, error) {
	titles, err := s.titleRepo.FindAll(ctx)
	if err != nil {
		return nil, apperrors.ErrDatabase.WithError(err)
	}

	res := make([]*vo.TitleVO, len(titles))
	for i, t := range titles {
		res[i] = &vo.TitleVO{
			ID:        t.ID,
			Name:      t.Name,
			SortOrder: t.SortOrder,
		}
	}
	return res, nil
}

func (s *userService) ListDepartments(ctx context.Context) ([]*vo.DepartmentVO, error) {
	depts, err := s.deptRepo.FindAll(ctx)
	if err != nil {
		return nil, apperrors.ErrDatabase.WithError(err)
	}

	res := make([]*vo.DepartmentVO, len(depts))
	for i, d := range depts {
		res[i] = &vo.DepartmentVO{
			ID:   d.ID,
			Name: d.Name,
		}
	}
	return res, nil
}

// generateEmployeeNo generates a new employee number with format EMP + 5 digits
func (s *userService) generateEmployeeNo(ctx context.Context) (string, error) {
	maxNo, err := s.userRepo.GetMaxEmployeeNo(ctx)
	if err != nil {
		return "", err
	}

	nextNum := 1
	if maxNo != "" {
		// Extract the numeric part from the max employee number
		numStr := strings.TrimPrefix(maxNo, "EMP")
		if num, err := strconv.Atoi(numStr); err == nil {
			nextNum = num + 1
		}
	}

	// Format: EMP + 5 digits (e.g., EMP00001, EMP00002)
	return fmt.Sprintf("EMP%05d", nextNum), nil
}

// ChangePassword allows user to change their own password
func (s *userService) ChangePassword(ctx context.Context, userID uint, req *dto.ChangePasswordRequest) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return apperrors.ErrUserNotFound
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.OldPassword)); err != nil {
		return errors.New("原密码错误")
	}

	// Validate new password is different from old password
	if req.OldPassword == req.NewPassword {
		return errors.New("新密码不能与原密码相同")
	}

	// Hash new password
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return apperrors.ErrInternal.WithError(err)
	}

	return s.userRepo.ChangePassword(ctx, userID, string(hashed))
}
