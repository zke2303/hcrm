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
	"hcrm/backend/internal/schema/converter"
	"hcrm/backend/internal/schema/vo"
)

// AuthService 认证服务接口
type AuthService interface {
	Login(ctx context.Context, req *vo.LoginRequest, ip string) (*vo.LoginResponse, error)
	Refresh(ctx context.Context, refreshToken string) (string, error)
	Logout(ctx context.Context, token string) error
	HasPermission(ctx context.Context, userID uint, permission string) (bool, error)
	GetDataScope(ctx context.Context, userID uint) (int, []uint, error)
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

	// 4. 加载角色、权限和菜单
	roles, perms, err := s.userRepo.GetRolesAndPermissions(ctx, user.ID)
	if err != nil {
		opLog.ErrorMsg = "加载权限失败: " + err.Error()
		return nil, err
	}
	menus, _ := s.userRepo.GetMenusByUserID(ctx, user.ID)
	menuVOs := converter.BuildMenuTree(converter.MenusToVOs(menus))

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
	deptID := uint(0)
	if user.DepartmentID != nil {
		deptID = *user.DepartmentID
	}

	token, err := s.jwt.GenerateToken(user.ID, user.Username, deptID)
	if err != nil {
		return nil, err
	}

	refresh, err := s.jwt.GenerateRefreshToken(user.ID, user.Username, deptID)
	if err != nil {
		return nil, err
	}

	// 7. 更新登录记录并清空频率限制
	_ = s.userRepo.UpdateLastLogin(ctx, user.ID, ip)
	_ = s.limiter.Reset(ctx, userKey)

	// 8. 异步缓存权限到 Redis
	go func() {
		cacheCtx := context.Background()
		permKey := fmt.Sprintf("hcrm:user:perms:%d", user.ID)
		apiKey := fmt.Sprintf("hcrm:user:apis:%d", user.ID)

		s.redis.Del(cacheCtx, permKey, apiKey)
		if len(perms) > 0 {
			permInterfaces := make([]interface{}, len(perms))
			for i, v := range perms {
				permInterfaces[i] = v
			}
			s.redis.SAdd(cacheCtx, permKey, permInterfaces...)
			s.redis.Expire(cacheCtx, permKey, 24*time.Hour)
		}

		var apiPaths []interface{}
		for _, m := range menus {
			if m.ApiPath != "" {
				apiPaths = append(apiPaths, m.ApiPath)
			}
		}
		if len(apiPaths) > 0 {
			s.redis.SAdd(cacheCtx, apiKey, apiPaths...)
			s.redis.Expire(cacheCtx, apiKey, 24*time.Hour)
		}
	}()

	// 9. 构造响应
	opLog.Status = 1 // 成功
	resp := &vo.LoginResponse{
		AccessToken:  token,
		RefreshToken: refresh,
		User: vo.UserInfo{
			ID:                 user.ID,
			Username:           user.Username,
			RealName:           user.RealName,
			Phone:              user.Phone,
			Roles:              roles,
			Permissions:        perms,
			Menus:              menuVOs,
			DepartmentID:       user.DepartmentID,
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

	deptID := uint(0)
	if user.DepartmentID != nil {
		deptID = *user.DepartmentID
	}
	return s.jwt.GenerateToken(user.ID, user.Username, deptID)
}

func (s *authService) Logout(ctx context.Context, token string) error {
	claims, err := s.jwt.ParseToken(token)
	if err == nil {
		// 清理权限缓存
		permKey := fmt.Sprintf("hcrm:user:perms:%d", claims.UserID)
		apiKey := fmt.Sprintf("hcrm:user:apis:%d", claims.UserID)
		s.redis.Del(ctx, permKey, apiKey)
	}
	return nil
}

func (s *authService) HasPermission(ctx context.Context, userID uint, permission string) (bool, error) {
	// 1. 超级管理员拥有所有权限
	if userID == 1 {
		return true, nil
	}

	// 2. 先从 Redis 缓存中查询 (针对 API 路径校验)
	apiKey := fmt.Sprintf("hcrm:user:apis:%d", userID)
	exists, err := s.redis.SIsMember(ctx, apiKey, permission).Result()
	if err == nil && exists {
		return true, nil
	}

	// 3. (针对权限码校验)
	permKey := fmt.Sprintf("hcrm:user:perms:%d", userID)
	exists, err = s.redis.SIsMember(ctx, permKey, permission).Result()
	if err == nil && exists {
		return true, nil
	}

	return false, nil
}

func (s *authService) GetDataScope(ctx context.Context, userID uint) (int, []uint, error) {
	if userID == 1 {
		return 1, nil, nil // Super admin gets all data
	}
	return s.userRepo.GetDataScope(ctx, userID)
}
