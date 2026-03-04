package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// LoginRateLimiter 登录频率限制器
type LoginRateLimiter struct {
	redis *redis.Client
}

// NewLoginRateLimiter 创建登录频率限制器
func NewLoginRateLimiter(rdb *redis.Client) *LoginRateLimiter {
	return &LoginRateLimiter{redis: rdb}
}

// IsAllowed 是否允许登录尝试（根据用户名或IP）
func (l *LoginRateLimiter) IsAllowed(ctx context.Context, key string, limit int, window time.Duration) (bool, error) {
	redisKey := fmt.Sprintf("hcrm:login_limit:%s", key)

	count, err := l.redis.Get(ctx, redisKey).Int()
	if err != nil && err != redis.Nil {
		return false, err
	}

	if count >= limit {
		return false, nil
	}

	// 递增计数
	pipe := l.redis.Pipeline()
	pipe.Incr(ctx, redisKey)
	pipe.Expire(ctx, redisKey, window)
	_, err = pipe.Exec(ctx)

	return true, err
}

// Reset 重置限制
func (l *LoginRateLimiter) Reset(ctx context.Context, key string) error {
	redisKey := fmt.Sprintf("hcrm:login_limit:%s", key)
	return l.redis.Del(ctx, redisKey).Err()
}
