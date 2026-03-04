package service

import (
	"context"

	"golang.org/x/crypto/bcrypt"

	"hcrm/backend/internal/errors"
	"hcrm/backend/internal/model"
	"hcrm/backend/internal/repository"
	"hcrm/backend/internal/schema/converter"
	"hcrm/backend/internal/schema/dto"
	"hcrm/backend/internal/schema/vo"
)

// UserService 用户服务接口
type UserService interface {
	Create(ctx context.Context, req *dto.CreateUserRequest) error
	Update(ctx context.Context, id uint, req *dto.UpdateUserRequest) error
	Delete(ctx context.Context, id uint) error
	GetByID(ctx context.Context, id uint) (*vo.UserVO, error)
	List(ctx context.Context, req *dto.ListUserRequest) (*vo.PageResponse, error)
	UpdateStatus(ctx context.Context, id uint, status int8) error
	ResetPassword(ctx context.Context, id uint, password string) error
	ListRoles(ctx context.Context) ([]*vo.RoleVO, error)
}

type userService struct {
	userRepo   repository.UserRepository
	doctorRepo repository.DoctorRepository
	deptRepo   repository.DepartmentRepository
}

// NewUserService 创建用户服务
func NewUserService(
	userRepo repository.UserRepository,
	doctorRepo repository.DoctorRepository,
	deptRepo repository.DepartmentRepository,
) UserService {
	return &userService{
		userRepo:   userRepo,
		doctorRepo: doctorRepo,
		deptRepo:   deptRepo,
	}
}

func (s *userService) Create(ctx context.Context, req *dto.CreateUserRequest) error {
	// 校验账号是否已存在
	if _, err := s.userRepo.GetByUsername(ctx, req.Username); err == nil {
		return errors.ErrUserExists
	}

	// 校验手机号是否已存在
	if _, err := s.userRepo.GetByPhone(ctx, req.Phone); err == nil {
		return errors.ErrPhoneExists
	}

	// 校验科室是否存在
	if req.DepartmentID != nil {
		if _, err := s.deptRepo.GetByID(ctx, *req.DepartmentID); err != nil {
			return errors.ErrDepartmentNotFound
		}
	}

	// 密码哈希
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return errors.ErrInternal.WithError(err)
	}

	user := &model.User{
		Username:     req.Username,
		PasswordHash: string(hashed),
		RealName:     req.RealName,
		Phone:        req.Phone,
		Email:        req.Email,
		EmployeeNo:   req.EmployeeNo,
		DepartmentID: req.DepartmentID,
		Remark:       req.Remark,
		Status:       1,
	}

	return s.userRepo.Transaction(ctx, func(txCtx context.Context) error {
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
}

func (s *userService) Update(ctx context.Context, id uint, req *dto.UpdateUserRequest) error {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return errors.ErrUserNotFound
	}

	// 校验手机号冲突
	if user.Phone != req.Phone {
		if _, err := s.userRepo.GetByPhone(ctx, req.Phone); err == nil {
			return errors.ErrPhoneExists
		}
	}

	// 校验科室
	if req.DepartmentID != nil {
		if _, err := s.deptRepo.GetByID(ctx, *req.DepartmentID); err != nil {
			return errors.ErrDepartmentNotFound
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
		if err := s.userRepo.UpdateRoles(txCtx, user.ID, req.RoleIDs); err != nil {
			return err
		}

		// 3. 联动更新医生档案
		doctor, err := s.doctorRepo.GetByUserID(txCtx, user.ID)
		if err != nil {
			return err
		}

		if req.IsDoctor {
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

		return nil
	})
}

func (s *userService) Delete(ctx context.Context, id uint) error {
	_, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return errors.ErrUserNotFound
	}
	return s.userRepo.Delete(ctx, id)
}

func (s *userService) GetByID(ctx context.Context, id uint) (*vo.UserVO, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.ErrUserNotFound
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
		return nil, errors.ErrDatabase.WithError(err)
	}

	// 批量获取科室名称
	deptIDs := make([]uint, 0)
	for _, u := range users {
		if u.DepartmentID != nil {
			deptIDs = append(deptIDs, *u.DepartmentID)
		}
	}
	depts, _ := s.deptRepo.ListByIDs(ctx, deptIDs)

	return &vo.PageResponse{
		Total: total,
		List:  converter.UserListToVO(users, depts),
	}, nil
}

func (s *userService) UpdateStatus(ctx context.Context, id uint, status int8) error {
	_, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return errors.ErrUserNotFound
	}
	return s.userRepo.UpdateStatus(ctx, id, status)
}

func (s *userService) ResetPassword(ctx context.Context, id uint, password string) error {
	_, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return errors.ErrUserNotFound
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return errors.ErrInternal.WithError(err)
	}

	return s.userRepo.ResetPassword(ctx, id, string(hashed))
}

func (s *userService) ListRoles(ctx context.Context) ([]*vo.RoleVO, error) {
	roles, err := s.userRepo.FindAllRoles(ctx)
	if err != nil {
		return nil, errors.ErrDatabase.WithError(err)
	}

	return converter.RoleListToVO(roles), nil
}
