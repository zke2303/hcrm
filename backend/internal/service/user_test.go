package service

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"

	"hcrm/backend/internal/model"
	"hcrm/backend/internal/schema/dto"
)

// MockUserRepository 用户仓储 Mock
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Transaction(ctx context.Context, fn func(txCtx context.Context) error) error {
	return fn(ctx)
}

func (m *MockUserRepository) GetByID(ctx context.Context, id uint) (*model.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) GetByUsername(ctx context.Context, username string) (*model.User, error) {
	args := m.Called(ctx, username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) GetByPhone(ctx context.Context, phone string) (*model.User, error) {
	args := m.Called(ctx, phone)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserRepository) List(ctx context.Context, req *dto.ListUserRequest) ([]*model.User, int64, error) {
	args := m.Called(ctx, req)
	return args.Get(0).([]*model.User), args.Get(1).(int64), args.Error(2)
}

func (m *MockUserRepository) Create(ctx context.Context, user *model.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) Update(ctx context.Context, user *model.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockUserRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockUserRepository) UpdateStatus(ctx context.Context, id uint, status int8) error {
	args := m.Called(ctx, id, status)
	return args.Error(0)
}

func (m *MockUserRepository) ResetPassword(ctx context.Context, id uint, passwordHash string) error {
	args := m.Called(ctx, id, passwordHash)
	return args.Error(0)
}

func (m *MockUserRepository) UpdateRoles(ctx context.Context, userID uint, roleIDs []uint) error {
	args := m.Called(ctx, userID, roleIDs)
	return args.Error(0)
}

func (m *MockUserRepository) GetRoles(ctx context.Context, userID uint) ([]model.Role, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]model.Role), args.Error(1)
}

func (m *MockUserRepository) ListRolesByUserIDs(ctx context.Context, userIDs []uint) (map[uint][]model.Role, error) {
	args := m.Called(ctx, userIDs)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(map[uint][]model.Role), args.Error(1)
}

func (m *MockUserRepository) GetRolesAndPermissions(ctx context.Context, userID uint) ([]string, []string, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).([]string), args.Get(1).([]string), args.Error(2)
}

func (m *MockUserRepository) GetMenusByUserID(ctx context.Context, userID uint) ([]*model.Menu, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.Menu), args.Error(1)
}

func (m *MockUserRepository) GetDoctorByUserID(ctx context.Context, userID uint) (*model.Doctor, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Doctor), args.Error(1)
}

func (m *MockUserRepository) UpdateLastLogin(ctx context.Context, userID uint, ip string) error {
	args := m.Called(ctx, userID, ip)
	return args.Error(0)
}

func (m *MockUserRepository) FindAllRoles(ctx context.Context) ([]model.Role, error) {
	args := m.Called(ctx)
	return args.Get(0).([]model.Role), args.Error(1)
}

func (m *MockUserRepository) GetMaxEmployeeNo(ctx context.Context) (string, error) {
	args := m.Called(ctx)
	return args.String(0), args.Error(1)
}

func (m *MockUserRepository) ChangePassword(ctx context.Context, userID uint, passwordHash string) error {
	args := m.Called(ctx, userID, passwordHash)
	return args.Error(0)
}

func (m *MockUserRepository) ClearMustChangePassword(ctx context.Context, userID uint) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *MockUserRepository) GetDataScope(ctx context.Context, userID uint) (int, []uint, error) {
	args := m.Called(ctx, userID)
	return args.Int(0), args.Get(1).([]uint), args.Error(2)
}

// MockDoctorRepository 医生仓储 Mock
type MockDoctorRepository struct {
	mock.Mock
}

func (m *MockDoctorRepository) Create(ctx context.Context, doctor *model.Doctor) error {
	args := m.Called(ctx, doctor)
	return args.Error(0)
}

func (m *MockDoctorRepository) Update(ctx context.Context, doctor *model.Doctor) error {
	args := m.Called(ctx, doctor)
	return args.Error(0)
}

func (m *MockDoctorRepository) GetByUserID(ctx context.Context, userID uint) (*model.Doctor, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Doctor), args.Error(1)
}

func (m *MockDoctorRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockDoctorRepository) UpdateDepartments(ctx context.Context, doctorID uint, deptIDs []uint, primaryDeptID uint) error {
	args := m.Called(ctx, doctorID, deptIDs, primaryDeptID)
	return args.Error(0)
}

func (m *MockDoctorRepository) FindInDepartments(ctx context.Context, deptIDs []uint) (map[uint][]*model.Doctor, error) {
	args := m.Called(ctx, deptIDs)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(map[uint][]*model.Doctor), args.Error(1)
}

func (m *MockDoctorRepository) RemoveFromDepartment(ctx context.Context, doctorID uint, deptID uint) error {
	args := m.Called(ctx, doctorID, deptID)
	return args.Error(0)
}

// MockDepartmentRepository 科室仓储 Mock
type MockDepartmentRepository struct {
	mock.Mock
}

func (m *MockDepartmentRepository) GetByID(ctx context.Context, id uint) (*model.Department, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Department), args.Error(1)
}

func (m *MockDepartmentRepository) ListByIDs(ctx context.Context, ids []uint) (map[uint]*model.Department, error) {
	args := m.Called(ctx, ids)
	return args.Get(0).(map[uint]*model.Department), args.Error(1)
}

func (m *MockDepartmentRepository) FindAll(ctx context.Context) ([]*model.Department, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.Department), args.Error(1)
}

func (m *MockDepartmentRepository) FindDescendantIDs(ctx context.Context, rootID uint) ([]uint, error) {
	args := m.Called(ctx, rootID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]uint), args.Error(1)
}

func (m *MockDepartmentRepository) Update(ctx context.Context, dept *model.Department) error {
	args := m.Called(ctx, dept)
	return args.Error(0)
}

// MockTitleRepository 职称仓储 Mock
type MockTitleRepository struct {
	mock.Mock
}

func (m *MockTitleRepository) FindAll(ctx context.Context) ([]*model.Title, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.Title), args.Error(1)
}

func TestUserService_Create(t *testing.T) {
	userRepo := new(MockUserRepository)
	doctorRepo := new(MockDoctorRepository)
	deptRepo := new(MockDepartmentRepository)
	titleRepo := new(MockTitleRepository)
	svc := NewUserService(userRepo, doctorRepo, deptRepo, titleRepo)

	ctx := context.Background()
	req := &dto.CreateUserRequest{
		Username: "testuser",
		RealName: "Test User",
		Phone:    "13800138000",
	}

	// 1. 模拟校验成功（返回记录未找到代表账号可用）
	userRepo.On("GetByUsername", ctx, req.Username).Return((*model.User)(nil), gorm.ErrRecordNotFound)
	userRepo.On("GetByPhone", ctx, req.Phone).Return((*model.User)(nil), gorm.ErrRecordNotFound)
	userRepo.On("GetMaxEmployeeNo", ctx).Return("EMP00000", nil)
	userRepo.On("Create", ctx, mock.AnythingOfType("*model.User")).Return(nil)

	_, err := svc.Create(ctx, req)

	assert.Nil(t, err)
	userRepo.AssertExpectations(t)
}
