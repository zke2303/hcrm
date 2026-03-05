## ADDED Requirements

### Requirement: 菜单与功能授权 (Tree)

系统需通过树形结构提供精细的权限授权能力。

#### Scenario: 树形权限加载

- **WHEN** 进入角色权限配置页。
- **THEN** 后端返回完整菜单树，且带有已授予的权限标识。

#### Scenario: 父子联动授权

- **WHEN** 勾选子节点。
- **THEN** 自动勾选逻辑上其所有直系父节点。
- **WHEN** 取消勾选父节点。
- **THEN** 自动取消勾选其下所有子节点（Cascading Uncheck）。

### Requirement: 功能级权限标识 (Buttons)

支持定义并校验细粒度的功能按钮权限。

#### Scenario: 页面显示控制

- **WHEN** 用户进入角色管理。
- **THEN** 系统根据其角色权限标识（如 `sys:role:add`）动态显隐“新建角色”等按钮。

### Requirement: 数据范围控制 (Data Scope)

根据角色配置的 `data_scope` 进行精细化的数据可见性过滤。

#### Scenario: 过滤逻辑

- **WHEN** 查询患者或医生列表且带有数据范围控制。
- **THEN** 系统根据 `data_scope`（全院/科室/本人）自动拼接 SQL 过滤条件。
  - `全部`: 不拼接过滤。
  - `本院`: 根据 `dept_id` 及下级机构链。
  - `本科室`: 限定 `dept_id` 相等。
  - `本人`: 限定 `creator_id` 或 `user_id` 为当前用户。

### Requirement: API 权限校验 (Backend)

后端鉴权拦截应作为安全审计的最后一环。

#### Scenario: 绕过前端访问

- **WHEN** 用户未授权该 API 指令却尝试直访问。
- **THEN** 后端中间件返回 `403 Forbidden`。
