package service

import (
	"context"
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

// DoctorService 医生服务接口
type DoctorService interface {
	Create(ctx context.Context, req *dto.CreateDoctorRequest) (*vo.DoctorVO, error)
	Update(ctx context.Context, id uint, req *dto.UpdateDoctorRequest) error
	Delete(ctx context.Context, id uint) error
	GetByID(ctx context.Context, id uint) (*vo.DoctorVO, error)
	List(ctx context.Context, req *dto.ListDoctorRequest) (*vo.PageResponse, error)
}

type doctorService struct {
	doctorRepo repository.DoctorRepository
	userRepo   repository.UserRepository
	deptRepo   repository.DepartmentRepository
	roleRepo   repository.RoleRepository
}

// NewDoctorService 创建医生服务
func NewDoctorService(
	doctorRepo repository.DoctorRepository,
	userRepo repository.UserRepository,
	deptRepo repository.DepartmentRepository,
	roleRepo repository.RoleRepository,
) DoctorService {
	return &doctorService{
		doctorRepo: doctorRepo,
		userRepo:   userRepo,
		deptRepo:   deptRepo,
		roleRepo:   roleRepo,
	}
}

func (s *doctorService) Create(ctx context.Context, req *dto.CreateDoctorRequest) (*vo.DoctorVO, error) {
	// 1. 校验手机号唯一性
	if _, err := s.userRepo.GetByPhone(ctx, req.Phone); err == nil {
		return nil, apperrors.ErrPhoneExists
	}
	if _, err := s.doctorRepo.GetByPhone(ctx, req.Phone); err == nil {
		return nil, apperrors.ErrPhoneExists
	}

	// 2. 校验科室
	dept, err := s.deptRepo.GetByID(ctx, req.DepartmentID)
	if err != nil || dept == nil {
		return nil, apperrors.ErrDepartmentNotFound
	}

	// 3. 生成工号 (如果是空的)
	employeeNo := req.EmployeeNo
	if employeeNo == "" {
		employeeNo, _ = s.generateEmployeeNo(ctx)
	}

	// 4. 准备用户数据
	const defaultPassword = "123456"
	hashed, _ := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)

	user := &model.User{
		Username:           req.Phone, // 手机号作为登录名
		PasswordHash:       string(hashed),
		RealName:           req.RealName,
		Phone:              req.Phone,
		EmployeeNo:         employeeNo,
		DepartmentID:       &req.DepartmentID,
		Status:             1,
		MustChangePassword: true,
	}

	var doctor *model.Doctor
	err = s.doctorRepo.Transaction(ctx, func(txCtx context.Context) error {
		// 创建用户
		if err := s.userRepo.Create(txCtx, user); err != nil {
			return err
		}

		// 分配角色
		if err := s.userRepo.UpdateRoles(txCtx, user.ID, req.RoleIDs); err != nil {
			return err
		}

		// 创建医生档案
		doctor = &model.Doctor{
			UserID:       &user.ID,
			RealName:     req.RealName,
			Phone:        req.Phone,
			Title:        req.Title,
			Specialty:    req.Specialty,
			Introduction: req.Introduction,
			AvatarURL:    req.AvatarURL,
			EmployeeNo:   employeeNo,
			Status:       1,
		}
		if err := s.doctorRepo.Create(txCtx, doctor); err != nil {
			return err
		}

		// 关联科室
		if err := s.doctorRepo.UpdateDepartments(txCtx, doctor.ID, []uint{req.DepartmentID}, req.DepartmentID); err != nil {
			return err
		}

		return nil
	})
	if err != nil {
		return nil, apperrors.ErrDatabase.WithError(err)
	}

	// 获取完整数据返回
	roles, _ := s.userRepo.GetRoles(ctx, user.ID)
	return converter.DoctorToVO(doctor, user, dept, roles), nil
}

func (s *doctorService) Update(ctx context.Context, id uint, req *dto.UpdateDoctorRequest) error {
	doctor, err := s.doctorRepo.GetByID(ctx, id)
	if err != nil || doctor == nil {
		return apperrors.ErrDoctorNotFound
	}

	user, err := s.userRepo.GetByID(ctx, *doctor.UserID)
	if err != nil || user == nil {
		return apperrors.ErrUserNotFound
	}

	// 校验手机号冲突
	if user.Phone != req.Phone {
		if _, err := s.userRepo.GetByPhone(ctx, req.Phone); err == nil {
			return apperrors.ErrPhoneExists
		}
	}

	// 校验科室
	dept, err := s.deptRepo.GetByID(ctx, req.DepartmentID)
	if err != nil || dept == nil {
		return apperrors.ErrDepartmentNotFound
	}

	// 更新用户
	user.RealName = req.RealName
	user.Phone = req.Phone
	user.Username = req.Phone
	user.EmployeeNo = req.EmployeeNo
	user.DepartmentID = &req.DepartmentID
	if req.Status != nil {
		user.Status = *req.Status
	}

	// 更新医生
	doctor.RealName = req.RealName
	doctor.Phone = req.Phone
	doctor.EmployeeNo = req.EmployeeNo
	doctor.Title = req.Title
	doctor.Specialty = req.Specialty
	doctor.Introduction = req.Introduction
	doctor.AvatarURL = req.AvatarURL
	if req.Status != nil {
		doctor.Status = *req.Status
	}

	return s.doctorRepo.Transaction(ctx, func(txCtx context.Context) error {
		if err := s.userRepo.Update(txCtx, user); err != nil {
			return err
		}
		if err := s.userRepo.UpdateRoles(txCtx, user.ID, req.RoleIDs); err != nil {
			return err
		}
		if err := s.doctorRepo.Update(txCtx, doctor); err != nil {
			return err
		}
		if err := s.doctorRepo.UpdateDepartments(txCtx, doctor.ID, []uint{req.DepartmentID}, req.DepartmentID); err != nil {
			return err
		}
		return nil
	})
}

func (s *doctorService) Delete(ctx context.Context, id uint) error {
	doctor, err := s.doctorRepo.GetByID(ctx, id)
	if err != nil || doctor == nil {
		return apperrors.ErrDoctorNotFound
	}

	return s.doctorRepo.Transaction(ctx, func(txCtx context.Context) error {
		// 删除医生档案 (软删除)
		if err := s.doctorRepo.Delete(txCtx, id); err != nil {
			return err
		}
		// 同时删除关联的用户
		if err := s.userRepo.Delete(txCtx, *doctor.UserID); err != nil {
			return err
		}
		return nil
	})
}

func (s *doctorService) GetByID(ctx context.Context, id uint) (*vo.DoctorVO, error) {
	doctor, err := s.doctorRepo.GetByID(ctx, id)
	if err != nil || doctor == nil {
		return nil, apperrors.ErrDoctorNotFound
	}

	user, _ := s.userRepo.GetByID(ctx, *doctor.UserID)
	roles, _ := s.userRepo.GetRoles(ctx, *doctor.UserID)

	// 获取主科室
	var primaryDept *model.Department
	if user != nil && user.DepartmentID != nil {
		primaryDept, _ = s.deptRepo.GetByID(ctx, *user.DepartmentID)
	}

	return converter.DoctorToVO(doctor, user, primaryDept, roles), nil
}

func (s *doctorService) List(ctx context.Context, req *dto.ListDoctorRequest) (*vo.PageResponse, error) {
	doctors, total, err := s.doctorRepo.List(ctx, req)
	if err != nil {
		return nil, apperrors.ErrDatabase.WithError(err)
	}

	list := make([]*vo.DoctorVO, 0, len(doctors))
	for _, d := range doctors {
		user, _ := s.userRepo.GetByID(ctx, *d.UserID)
		roles, _ := s.userRepo.GetRoles(ctx, *d.UserID)

		var primaryDept *model.Department
		if user != nil && user.DepartmentID != nil {
			primaryDept, _ = s.deptRepo.GetByID(ctx, *user.DepartmentID)
		}

		list = append(list, converter.DoctorToVO(d, user, primaryDept, roles))
	}

	return &vo.PageResponse{
		Total: total,
		List:  list,
	}, nil
}

func (s *doctorService) generateEmployeeNo(ctx context.Context) (string, error) {
	maxNo, err := s.userRepo.GetMaxEmployeeNo(ctx)
	if err != nil {
		return "", err
	}

	nextNum := 1
	if maxNo != "" {
		numStr := strings.TrimPrefix(maxNo, "EMP")
		if num, err := strconv.Atoi(numStr); err == nil {
			nextNum = num + 1
		}
	}

	return fmt.Sprintf("EMP%05d", nextNum), nil
}
