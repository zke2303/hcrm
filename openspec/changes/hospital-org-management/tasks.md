## 1. 数据库重构与模型迁移

- [x] 1.1 创建 `doctor_departments` 关联表模型及 GORM 定义。
- [x] 1.2 编写 Migration 逻辑：将 `doctors.department_id` 存量数据导入 `doctor_departments`。
- [x] 1.3 从 `Doctor` 模型中删除 `department_id` 字段并更新相关查询。

## 2. 后端 API 与业务逻辑 (Service V2)

- [x] 2.1 修改 `DepartmentRepository` 支持递归查询下属所有科室 ID。
- [x] 2.2 实现按科室分组聚合医生的 Service 接口 (`GetStaffByDeptRecursive`)。
- [x] 2.3 修改 `UpdateHierarchy` 逻辑，增加循环移动的安全检测。
- [x] 2.4 实现 `AssignStaffToDept` 和 `RemoveStaffFromDept` 的关联管理逻辑业务逻辑。
- [x] 2.5 实现 `DepartmentHandler` 并注册相关路由。

## 3. 前端分栏布局与组件开发

- [x] 3.1 搭建“左树右表”的基础布局（基于 `Resizable` 组件）。
- [x] 3.2 实现可拖拽的 `OrgTree` 组件，处理 `onDrop` 事件调用后端层级更新。
- [x] 3.3 开发 `GroupedStaffList` 组件，实现按科室分组的医生列表展示。
- [x] 3.4 集成左侧树点击后的 `selectedId` 全局状态，驱动右侧列表刷新。

## 4. 集成与验证

- [ ] 4.1 联调测试科室层级拖拽后的实时更新。
- [ ] 4.2 验证一名医生在多科室显示及移除逻辑。
- [ ] 4.3 执行数据迁移脚本并校验存量数据的准确性。
