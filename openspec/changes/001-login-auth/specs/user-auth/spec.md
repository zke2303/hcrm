## ADDED Requirements

### Requirement: 用户登录验证

系统应通过用户名和密码验证用户身份，并返回加密的服务凭证。密码存储必须经过 bcrypt 加密处理。

#### Scenario: 成功登录

- **WHEN** 用户提供正确的用户名和匹配的密码
- **THEN** 系统返回 HTTP 200，并包含 Access Token (JWT) 及设置 HttpOnly 的 Refresh Token Cookie

#### Scenario: 登录失败（凭据错误）

- **WHEN** 用户提供了错误的密码或不存在的用户名
- **THEN** 系统返回 HTTP 401 错误，提示身份验证失败

### Requirement: 记住我 (Keep Logged In)

系统应支持长效会话，通过 Refresh Token 实现即使关闭浏览器也能在有效期内自动登录。

#### Scenario: 勾选记住我后再次访问

- **WHEN** 用户在登录时勾选了“记住我”，且后续 Access Token 过期但 Refresh Token 仍有效
- **THEN** 前端自动调用刷新接口获取新的 Access Token，用户无需重新输入密码

### Requirement: 忘记密码

系统应提供一种找回账号访问权限的机制。

#### Scenario: 触发重置密码流程

- **WHEN** 用户在登录页点击“忘记密码”并提交关联的电子邮箱
- **THEN** 系统验证邮箱存在并发送包含重置凭证的通知（当前阶段模拟通知发送）
