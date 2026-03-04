package database

import (
	"context"
	"fmt"
	"time"

	"hcrm/backend/internal/config"

	"github.com/redis/go-redis/v9"
)

// NewRedis 创建 Redis 连接
func NewRedis(cfg *config.RedisConfig) (*redis.Client, func(), error) {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.Addr(),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	// 测试连接
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, nil, fmt.Errorf("连接 Redis 失败: %w", err)
	}

	cleanup := func() {
		if client != nil {
			_ = client.Close()
		}
	}

	return client, cleanup, nil
}
