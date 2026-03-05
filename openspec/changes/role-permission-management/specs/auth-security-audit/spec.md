## ADDED Requirements

### Requirement: 超级管理员特殊保护 (Hard-Coded / In-Memory Protection)

系统内部必须对此类关键角色的安全策略进行绝对管控。

#### Scenario: 禁止删除超级管理员

- **WHEN** 发起删除 `id=1` 的预设超级管理员（或 `admin` 账号）的请求。
- **THEN** 系统后端返回 `403 Forbidden`（禁止操作系统内置角色/管理员）。

#### Scenario: 防止权限越权

- **WHEN** 管理员修改其他具有超级管理权限的角色，尝试赋予比自身权限更高的范围。
- **THEN** 系统进行后端校验，拒绝保存非法授权申请（Privilege Escalation Protection）。

### Requirement: 审计日志与追溯系统 (Permissions Logging)

记录所有敏感权限变更。

#### Scenario: 角色编辑日志

- **WHEN** 角色信息被更改。
- **THEN** 后端逻辑自动记入操作日志（包含修改人、角色的 ID/Name，修改前的原属性，修改后的新属性，操作 IP 和时间）。

#### Scenario: 用户授权变更审计

- **WHEN** 给用户重新分配了角色集合。
- **THEN** 系统记录“授权变更”类操作日志，明确指出“角色 ID X、Y 被成功分配给用户 Z”。
