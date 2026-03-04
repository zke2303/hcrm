## Why

当前系统缺乏用户认证机制，无法区分用户身份和保护敏感数据。作为医疗 CRM 系统（HCRM）的核心驱动，安全可靠的登录系统是后续所有业务功能（如病历管理、预约系统等）的前提。我们需要一个符合现代安全标准（如加密存储、JWT 认证）且用户体验优秀的登录流程。

## What Changes

本变更将引入完整的用户认证体系：

1. **后端 (Go)**：实现基于 JWT 的身份验证接口，包含登录、令牌刷新、密码重置请求等逻辑。
2. **前端 (React)**：创建一个 Premium 级别的“极简白”风格登录页面，包含登录表单、记住我勾选框、忘记密码链接及相应的状态管理。
3. **数据库**：在 MySQL 中建立用户表，用于存储身份凭证（密码使用 bcrypt 加密）。

## Capabilities

### New Capabilities

- `user-auth`: 提供用户的身份验证能力，包含登录验证、会话管理（JWT）及基础的账号安全操作。

### Modified Capabilities

- 无

## Impact

- **API**: 新增 `/api/v1/auth/login`, `/api/v1/auth/refresh`等接口。
- **数据库**: 新增 `users` 表。
- **依赖**: 后端引入 `golang.org/x/crypto/bcrypt` 和 `github.com/golang-jwt/jwt`；前端可能引入图标库或动画库。
