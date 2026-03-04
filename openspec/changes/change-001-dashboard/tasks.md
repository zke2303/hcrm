## 1. 数据库优化 (P0)

- [ ] 1.1 为 `follow_up_tasks` 表添加优化查询的组合索引 `idx_dashboard_stats` (status, plan_time, department_id)。
- [ ] 1.2 验证在大数据量下的统计查询性能，必要时调整索引。

## 2. 后端 API 实现 (P1)

- [ ] 2.1 在 `internal/model` 中确认或补充 Dashboard 所需的统计模型。
- [ ] 2.2 在 `internal/repository` 中实现 KPI 聚合、趋势图、科室排名相关的查询方法。
- [ ] 2.3 在 `internal/service` 中编写 `DashboardService` 业务逻辑，处理数据归一化。
- [ ] 2.4 在 `internal/handler` 中新增 `DashboardHandler` 并实现聚合数据 API 接口。
- [ ] 2.5 在 `internal/app/app.go` 中注册 `/api/v1/dashboard/stats` 等相关路由并挂载权限中间件。

## 3. 前端 Dashboard 实现 (P1)

- [ ] 3.1 在前端安装 `recharts` 依赖。
- [ ] 3.2 实现 `features/dashboard/api.ts` 以调用后端聚合接口。
- [ ] 3.3 开发 Dashboard KPI 指标卡组件 (StatsCards.tsx)。
- [ ] 3.4 开发随访趋势折线图组件 (TrendChart.tsx)。
- [ ] 3.5 开发科室排行柱状图组件 (DepartmentRank.tsx)。
- [ ] 3.6 完成 Dashboard 主页面布局并集成以上组件。
- [ ] 3.7 在侧边栏导航中新增“控制台/Dashboard”入口。

## 4. 联调与验证 (P2)

- [ ] 4.1 前后端联调，确保筛选范围（今日/近 30 天）逻辑正确。
- [ ] 4.2 验证逾期任务红色报警功能的展示。
- [ ] 4.3 进项简单的组件冒烟测试，确保无白屏问题。
