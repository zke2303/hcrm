## ADDED Requirements

### Requirement: 深度身份验证与授权

系统应验证用户身份，并返回包含权限、角色及业务绑定的完整凭证。

#### Scenario: 成功登录 (带权限与业务绑定)

- **WHEN** 医生用户提供正确的凭据
- **THEN** 系统返回 HTTP 200，响应体包含：
  - Access Token (含 Roles/Permissions 声明)
  - User 基础信息
  - 关联的 `doctorId` 及其所属科室数据
  - 同时设置 HttpOnly 的 Refresh Token Cookie

#### Scenario: 登录失败与锁定 (防暴破)

- **WHEN** 用户连续 5 次输入错误密码
- **THEN** 系统在第 6 次尝试时返回 HTTP 429 或 403，提示“账号已锁定，请 15 分钟后再试”，并在 Redis 中存储锁定状态

### Requirement: 账号状态联动

系统应确保账号可用性与业务状态同步。

#### Scenario: 离职医生登录拒绝

- **WHEN** 一个 `Doctor.Status = 0` (离职) 的用户尝试登录
- **THEN** 即使密码正确，系统也应返回 HTTP 403，提示“账号已停用”，并自动将 `User.Status` 标记为禁用

### Requirement: 审计日志自动化

所有认证行为必须可追溯。

#### Scenario: 登录审计生成

- **WHEN** 任何登录尝试发生（无论成功或失败）
- **THEN** 系统必须在 `operation_logs` 表中插入一条记录，包含 IP、Action(Login)、Status 及关联的 UserID（若已知）

### Requirement: 动态权限 UI

前端应具备基于权限的渲染能力。

#### Scenario: 权限渲染校验

- **WHEN** 前端收到 Permissions 数组不含 `patient:delete`
- **THEN** 页面上的“删除病历”按钮应对该用户不可见或呈禁用状态
