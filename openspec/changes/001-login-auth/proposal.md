## Why

当前系统缺乏用户认证机制，无法区分用户身份和保护敏感数据。作为医疗 CRM 系统（HCRM）的核心驱动，安全可靠的登录系统是后续所有业务功能（如病历管理、预约系统等）的前提。我们需要一个符合现代安全标准、深度集成权限控制且具备业务感知的认证体系。

## What Changes

本变更将引入完整的用户认证与初步授权机制：

1. **后端 (Go)**：
   - 实现基于 JWT 的双令牌（Access/Refresh）认证接口。
   - **集成 RBAC**：登录时下发用户的角色 (Roles) 与权限 (Permissions) 列表。
   - **业务绑定**：登录响应包含关联的 `DoctorID` 及科室信息。
   - **安全增强**：引入 Redis 实现登录限频（防暴力破解）和令牌黑名单。
   - **审计日志**：自动记录登录/登出事件到 `OperationLog`。
2. **前端 (React)**：
   - 创建 Premium 级别的“极简白”动态化登录页面。
   - 引入 Glassmorphism 设计风格与细腻的交互动效。
   - 实现权限指令/组件，根据返回的 Permissions 自动控制 UI 元素可见性。
3. **数据库/存储**：
   - 利用现有的 `users` 表及 RBAC 相关表。
   - 引入 Redis 用于存储临时安全状态。

## Capabilities

### New Capabilities

- `user-auth`: 提供用户的身份验证、权限同步、会话管理及登录审计能力。

### Modified Capabilities

- 无

## Impact

- **API**: 新增 `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/refresh` 等接口。
- **依赖**:
  - 后端：`golang.org/x/crypto/bcrypt`, `github.com/golang-jwt/jwt`, `github.com/go-redis/redis`.
  - 前端：`zustand` (状态管理), `framer-motion` (动画)。
- **安全**: 增加防暴破机制，提升系统健壮性。
