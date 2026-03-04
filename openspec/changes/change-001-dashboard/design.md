## Context

<!-- Background and current state -->

系统目前主要功能侧重于随访流程执行，管理人员无法直观获取全院随访工作的宏观视图。现有的 `follow_up_tasks` 表存储了海量的任务数据，但缺乏有效的实时聚合展示。

## Goals / Non-Goals

**Goals:**

<!-- What this design aims to achieve -->

- 提供实时的 KPI 指标（总数、完成率、逾期数、风险率）。
- 实现近 30 天随访完成率的趋势可视化。
- 提供各科室随访效能的排行榜。
- 确保 Dashboard 数据查询的性能，响应时间控制在 2 秒内。

**Non-Goals:**

<!-- What is explicitly out of scope -->

- 本次不实现导出的功能（PDF/Excel 报表）。
- 本次不实现自定义看板组件（用户拖拽布局）。
- 不涉及除随访任务外的其他系统模块统计。

## Decisions

<!-- Key design decisions and rationale -->

### 1. 技术栈选型

- **前端图表**: 使用 `recharts` 库，因为它与 React 深度集成且配置灵活，能够很好地实现双折线趋势图和水平柱状图。
- **后端聚合**: 采用 SQL 聚合查询。鉴于 `follow_up_tasks` 表可能存在大量数据，将在 `status`, `plan_time`, `department_id` 等字段上优化索引。

### 2. API 设计

- **统一聚合端点**: 设计 `/api/v1/dashboard/stats` 端点，通过查询参数（如 `scope`, `days`）返回 KPI、趋势和排行数据，减少前端请求次数。
- **响应格式**: 遵循 `ApiResponse<T>` 标准格式。

### 3. 数据层优化

- 在 `follow_up_tasks` 表上建立组合索引 `idx_dashboard_stats (department_id, status, plan_time)` 以支持高性能的过滤和聚合。

## Risks / Trade-offs

<!-- Known risks and trade-offs -->

- **性能风险**: 当任务数据达到百万级时，实时聚合 SQL 可能变慢。
  - **对策**: 若出现性能瓶颈，后续版本将引入 Redis 缓存或任务状态统计宽表。
- **数据延迟**: 实时查询会给数据库带来压力。
  - **权衡**: 在此初始版本中优先保证数据实时性，牺牲一部分极端数据量下的性能。
