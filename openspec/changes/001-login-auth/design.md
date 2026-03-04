## Context

HCRM 系统目前没有用户认证层。我们需要从头开始，为前端 (React) 和后端 (Go) 建立安全规范。

## Goals / Non-Goals

**Goals:**

1. 实现安全的密码存储 (bcrypt)。
2. 建立双令牌认证系统 (Access Token & Refresh Token)。
3. 为前端实施“蓝白色” (Professional Blue & Clinical White) 设计风格。
4. 在 GORM 基础上实现用户 Repository 层。

**Non-Goals:**

1. 集成 LDAP 或第三方社会化登录 (OAuth2)。
2. 实现极度复杂的角色/权限控制 (RBAC) - 本阶段仅限账号登录。
3. 实现真实的邮件发送系统（暂用日志打印替代）。

## Decisions

1. **认证驱动**: 使用 JWT (AccessToken + RefreshToken)。AccessToken 存储在内存以防 XSS，RefreshToken 存储在 HttpOnly Cookie 以维持会话。
2. **密码加密**: 使用 `bcrypt` 算法，哈希强度设置为 10 (DefaultCost)。
3. **数据库**: 在 `users` 表中，`username` 设计为唯一索引 (Unique Index)。
4. **前端 UI**: 基于原生 CSS 实现“蓝白色”布局。主色使用医疗蓝 (#0056D2)，背景使用冰点白 (#FBFDFF)，提升信任感。

## Risks / Trade-offs

1. **令牌泄露风险**: 虽然使用了 HttpOnly，但客户端仍需谨慎处理以防重放。
2. **状态管理开销**: 前端需要一个精简的服务层来自动管理令牌续签。
3. **单点故障**: 如果存储 Refresh Token 的数据库/Redis 宕机，所有活跃会话将失效。
