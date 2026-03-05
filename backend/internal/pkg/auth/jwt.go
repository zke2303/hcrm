package auth

import (
	"errors"
	"time"

	"hcrm/backend/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

// Claims JWT 载荷
type Claims struct {
	UserID       uint   `json:"userID"`
	Username     string `json:"username"`
	DepartmentID uint   `json:"departmentID"`
	jwt.RegisteredClaims
}

// JWTHelper JWT 助手
type JWTHelper struct {
	secret []byte
	expire time.Duration
}

// NewJWTHelper 创建 JWT 助手
func NewJWTHelper(cfg *config.JWTConfig) *JWTHelper {
	return &JWTHelper{
		secret: []byte(cfg.Secret),
		expire: time.Duration(cfg.Expire) * time.Hour,
	}
}

// GenerateToken 生成令牌
func (h *JWTHelper) GenerateToken(userID uint, username string, deptID uint) (string, error) {
	return h.generateTokenWithExpire(userID, username, deptID, h.expire)
}

// GenerateRefreshToken 生成刷新令牌 (7天过期)
func (h *JWTHelper) GenerateRefreshToken(userID uint, username string, deptID uint) (string, error) {
	return h.generateTokenWithExpire(userID, username, deptID, 7*24*time.Hour)
}

func (h *JWTHelper) generateTokenWithExpire(userID uint, username string, deptID uint, expire time.Duration) (string, error) {
	claims := Claims{
		UserID:       userID,
		Username:     username,
		DepartmentID: deptID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expire)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(h.secret)
}

// ParseToken 解析令牌
func (h *JWTHelper) ParseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return h.secret, nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
