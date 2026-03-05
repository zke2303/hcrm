## Context

系统目前已有 `Department` 和 `Doctor` 模型，但存在硬性一对一关联限制。现需要升级为更灵活的多对多关联，并提供“左树右表”的管理界面。

## Goals / Non-Goals

**Goals:**
- **模型重构**：实现 `doctor_departments` 关联表，支持一医多科。
- **递归聚合**：点击父级科室时，右侧列表需下钻展示所有子孙科室的医生。
- **分组展示**：右侧人员列表按科室名（组名）聚合，科室顺序由 `SortOrder` 决定。
- **可视化树**：左侧树支持科室拖拽（Dnd）修改父级。

**Non-Goals:**
- 不支持医务人员的拖拽（仅限科室节点拖拽）。
- 不支持人员跨医院分配。

## Decisions

### 1. 数据库关联：一对多 -> 多对多
**决策：** 引入关联表 `doctor_departments`。
**理由：** 直接在 `doctors` 存储数组/JSON 不利于索引查询和 GORM 级联操作。

### 2. 后端递归查询方案
**决策：** 采用 `department_id` 集合查询。
**理由：** 后端在收到 `dept_id` 请求后，首先递归计算出该节点及其所有子节点的 ID 列表，然后执行 `WHERE dept_id IN (?)` 查询。考虑到科室层级深度通常小于 10，这种方式简单且性能足够。

### 3. 前端分栏布局 (Resizable Panels)
**决策：** 使用 `react-resizable-panels` 结合 `shadcn/ui` 的 UI 规范。
**理由：** “左树右表”结构中，用户通常需要调整分栏比例以适应长名称，Resizable 组件能提供更专业的体验。

### 4. 数据平滑迁移
**决策：** 在 Migration 阶段执行 `INSERT INTO doctor_departments (doctor_id, department_id, is_primary) SELECT id, department_id, true FROM doctors`。
**理由：** 确保上线后存量医生能正确归属于其原有的单科室。

## Risks / Trade-offs

- **[Risk]** 医生出现在多个科室，列表去重逻辑复杂。
  - **Mitigation**：在递归查询人员时，如果同一医生在多个子科室中，列表按科室分组会重复显示该医生（这符合业务逻辑：一个医生在多个子部门工作），不需要物理去重。
- **[Risk]** 树节点循环移动。
  - **Mitigation**：在 `UpdateHierarchy` 中执行路径闭环检测（Path Closure Check）。
