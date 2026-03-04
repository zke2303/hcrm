## Why

<!-- Explain the motivation for this change. What problem does this solve? Why now? -->

当前医院管理者缺乏一个统一的、实时的“管理决策看板”来全面监控随访效能和质量。通过该看板，决策层可以直观了解全院或各科室的随访任务执行情况、完成率趋势以及高风险预警，从而优化资源分配并提升医疗服务质量。

## What Changes

<!-- Describe what will change. Be specific about new capabilities, modifications, or removals. -->

1.  **新增管理看板页面**：在前端系统管理菜单下或作为默认登录页，新增一个综合决策看板。
2.  **核心指标统计**：实现包括“今日随访总数”、“已完成数”、“逾期预警数”和“风险检出率”在内的 KPI 统计。
3.  **效能趋势分析**：引入 30 天随访完成率趋势图（双折线图）和科室效能排行（柱状图）。
4.  **后端统计接口**：新增支持 Dashboard 数据聚合的 API 接口，涉及任务状态统计、周期性趋势计算及科室维度汇总。

## Capabilities

### New Capabilities

<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

- `dashboard-stats`: 提供管理看板所需的所有统计数据接口，包括 KPI 卡片、趋势图和排行榜数据。
- `management-dashboard-ui`: 实现管理决策看板的前端界面，包含卡片组件、趋势折线图和排名柱状图。

### Modified Capabilities

<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->

## Impact

<!-- Affected code, APIs, dependencies, systems -->

- **前端 (React)**: 需要新增 `features/dashboard` 目录及相关组件。
- **后端 (Go)**: 需要在 `handler` 和 `service` 层新增统计逻辑，可能需要优化 `follow_up_tasks` 表的索引以支持高性能聚合查询。
- **API**: 新增 `/api/dashboard/stats` 等相关端点。
