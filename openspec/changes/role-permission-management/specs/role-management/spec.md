## ADDED Requirements

### Requirement: 角色基础管理 (CRUD)

系统应支持对角色的完整生命周期管理。

#### Scenario: 新建角色

- **WHEN** 管理员输入角色名称（唯一）、角色编码（唯一）、备注且确认。
- **THEN** 系统后端校验唯一性，保存并返回成功。

#### Scenario: 编辑角色

- **WHEN** 管理员修改已存在角色的基本信息。
- **THEN** 系统更新角色表中除 ID 外的可编辑字段。

#### Scenario: 删除角色

- **WHEN** 管理员发起删除指令（内建角色禁止通过删除 API）。
- **THEN** 系统进行物理逻辑删除，并清理 `user_roles` 和 `role_permissions` 关联。

### Requirement: 启用/禁用控制

能够一键切换角色的可用状态。

#### Scenario: 切换角色状态

- **WHEN** 角色从启用切为禁用。
- **THEN** 关联该角色的所有用户立即失去对应权限（需刷新缓存）。

### Requirement: 角色复制

支持快速创建相似角色。

#### Scenario: 复制角色

- **WHEN** 选择角色 A 进行复制。
- **THEN** 系统创建角色 B，其名称带“副本”后缀，且克隆 A 的所有权限关联（不包含用户）。
