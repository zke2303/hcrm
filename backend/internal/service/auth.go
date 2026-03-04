package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"

	"hcrm/backend/internal/model"
	"hcrm/backend/internal/pkg/auth"
	"hcrm/backend/internal/repository"
	"hcrm/backend/internal/schema/vo"
)

// AuthService 认证服务接口
type AuthService interface {
	Login(ctx context.Context, req *vo.LoginRequest, ip string) (*vo.LoginResponse, error)
	Refresh(ctx context.Context, refreshToken string) (string, error)
	Logout(ctx context.Context, token string) error
}

type authService struct {
	userRepo repository.UserRepository
	logRepo  repository.OperationLogRepository
	limiter  *auth.LoginRateLimiter
	jwt      *auth.JWTHelper
	redis    *redis.Client
}

// NewAuthService 创建认证服务
func NewAuthService(
	userRepo repository.UserRepository,
	logRepo repository.OperationLogRepository,
	limiter *auth.LoginRateLimiter,
	jwt *auth.JWTHelper,
	redis *redis.Client,
) AuthService {
	return &authService{
		userRepo: userRepo,
		logRepo:  logRepo,
		limiter:  limiter,
		jwt:      jwt,
		redis:    redis,
	}
}

func (s *authService) Login(ctx context.Context, req *vo.LoginRequest, ip string) (*vo.LoginResponse, error) {
	// 0. 频率限制 (根据用户名和IP)
	userKey := fmt.Sprintf("u:%s", req.Username)
	ipKey := fmt.Sprintf("ip:%s", ip)

	if allowed, _ := s.limiter.IsAllowed(ctx, userKey, 5, 1*time.Hour); !allowed {
		return nil, errors.New("账号由于尝试次数过多已被锁定，请1小时后再试")
	}
	if allowed, _ := s.limiter.IsAllowed(ctx, ipKey, 20, 1*time.Hour); !allowed {
		return nil, errors.New("请求过于频繁，请稍后再试")
	}

	// 记录操作日志初始化
	opLog := &model.OperationLog{
		Username:      req.Username,
		Module:        "认证模块",
		Action:        "登录",
		IPAddress:     ip,
		RequestMethod: "POST",
		RequestURL:    "/api/v1/auth/login",
		Status:        0, // 默认失败
	}

	defer func() {
		// 最终存储操作日志
		_ = s.logRepo.Create(ctx, opLog)
	}()

	// 1. 获取用户信息
	user, err := s.userRepo.GetByUsername(ctx, req.Username)
	if err != nil {
		opLog.ErrorMsg = "用户不存或数据库异常"
		return nil, errors.New("用户名或密码错误")
	}

	opLog.UserID = &user.ID
	opLog.RealName = user.RealName

	// 2. 状态检查
	if user.Status != 1 {
		opLog.ErrorMsg = "账号已禁用"
		return nil, errors.New("账号已被禁用")
	}

	// 3. 密码校验
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		opLog.ErrorMsg = "密码校验未通过"
		return nil, errors.New("用户名或密码错误")
	}

	// 4. 加载角色和权限
	roles, permissions, err := s.userRepo.GetRolesAndPermissions(ctx, user.ID)
	if err != nil {
		opLog.ErrorMsg = "加载权限失败: " + err.Error()
		return nil, err
	}

	// 5. 绑定医生信息
	doctor, err := s.userRepo.GetDoctorByUserID(ctx, user.ID)
	if err != nil {
		opLog.ErrorMsg = "查询医生档案失败: " + err.Error()
		return nil, err
	}

	// Step 3 特色功能: 人事档案离职联动检查
	if doctor != nil && doctor.Status == 0 {
		opLog.ErrorMsg = "由于人事档案离职，账号已自动封锁"
		return nil, errors.New("您的账号由于关联的人事档案状态为离职，已被自动锁定")
	}

	// 6. 生成令牌
	token, err := s.jwt.GenerateToken(user.ID, user.Username)
	if err != nil {
		return nil, err
	}

	refresh, err := s.jwt.GenerateRefreshToken(user.ID, user.Username)
	if err != nil {
		return nil, err
	}

	// 7. 更新登录记录并清空频率限制
	_ = s.userRepo.UpdateLastLogin(ctx, user.ID, ip)
	_ = s.limiter.Reset(ctx, userKey)

	// 8. 构造响应
	opLog.Status = 1 // 成功
	resp := &vo.LoginResponse{
		AccessToken:  token,
		RefreshToken: refresh,
		User: vo.UserInfo{
			ID:                user.ID,
			Username:          user.Username,
			RealName:          user.RealName,
			Phone:             user.Phone,
			Roles:             roles,
			Permissions:       permissions,
			DepartmentID:      user.DepartmentID,
			MustChangePassword: user.MustChangePassword,
		},
	}

	if doctor != nil {
		resp.User.DoctorID = &doctor.ID
	}

	return resp, nil
}

func (s *authService) Refresh(ctx context.Context, refreshToken string) (string, error) {
	claims, err := s.jwt.ParseToken(refreshToken)
	if err != nil {
		return "", errors.New("无效或过期的刷新令牌")
	}

	user, err := s.userRepo.GetByUsername(ctx, claims.Username)
	if err != nil || user.Status != 1 {
		return "", errors.New("账号异常，无法刷新令牌")
	}

	return s.jwt.GenerateToken(user.ID, user.Username)
}

func (s *authService) Logout(ctx context.Context, token string) error {
	// 这里可以扩展：将 AccessToken 加入 Redis 黑名单
	// 以及记录注销日志
	return nil
}
