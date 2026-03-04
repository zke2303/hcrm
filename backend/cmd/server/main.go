package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"

	"hcrm/backend/internal/injector"
	"hcrm/backend/internal/pkg/logger"
)

func main() {
	// 解析命令行参数
	configPath := flag.String("config", "", "配置文件路径")
	flag.Parse()

	// 构建应用
	app, cleanup, err := injector.BuildApp(*configPath)
	if err != nil {
		_, _ = fmt.Fprintf(os.Stderr, "构建应用失败: %v\n", err)
		os.Exit(1)
	}
	defer cleanup()

	// 启动信号监听
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// 启动服务器（在 goroutine 中）
	errCh := make(chan error, 1)
	go func() {
		if err := app.Run(); err != nil {
			errCh <- err
		}
	}()

	// 等待退出信号
	select {
	case <-quit:
		logger.Info("收到退出信号，正在关闭服务器...")
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := app.Stop(ctx); err != nil {
			logger.Error("关闭服务器失败", zap.Error(err))
		}
	case err := <-errCh:
		logger.Error("服务器运行错误", zap.Error(err))
	}

	logger.Sync()
}