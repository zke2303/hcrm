## 1. 数据库与基础模型

- [ ] 1.1 在 `backend/internal/model/` 中创建 `User` 模型，包含用户名、加密密码、邮箱等字段。
- [ ] 1.2 编写数据库迁移逻辑（或 SQL 脚本），创建 `users` 表。

## 2. 后端认证服务实现

- [ ] 2.1 实现 `AuthRepository`，处理用户查询与保存。
- [ ] 2.2 实现 `AuthService`，集成 `bcrypt` 的密码校验逻辑。
- [ ] 2.3 实现 JWT 签发工具（Access Token 与 Refresh Token）。
- [ ] 2.4 实现 `LoginHandler` 接口，处理 `/api/v1/auth/login` 请求并正确设置 HttpOnly Cookie。
- [ ] 2.5 集成 Auth 中间件，保护需要认证的接口。

## 3. 前端界面与逻辑开发

- [ ] 3.1 在 `frontend/src/` 中设计并实现“极简白”风格的登录卡片 (LoginCard)。
- [ ] 3.2 实现前端 Auth Context/Hook，管理全局 Access Token 状态。
- [ ] 3.3 实现 API 客户端（如 Axios 拦截器），自动处理 401 状态时的 Token 刷新。
- [ ] 3.4 路由保护：确保未登录用户重定向至登录页。

## 4. 集成验证与测试

- [ ] 4.1 执行端到端测试，验证完整的登录、持续登录（Remember Me）流程。
- [ ] 4.2 验证密码在数据库中的存储是否为加密 hash。
