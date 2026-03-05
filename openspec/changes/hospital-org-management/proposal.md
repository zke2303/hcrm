## Why

当前系统科室管理过于简单，且医生与科室采用“一对一”关联，无法满足现实医院中“医生跨科室挂职”或“一人分属多个部门”的复杂业务需求。此外，缺乏一个直观的界面来维护“医院-科室”的层级树，并高效管理各层级下的人员分布。

## What Changes

- **数据库模型重构 (BREAKING)**：废弃医生表中的单科室 ID，引入 `doctor_departments` 关联表，支持一名医生同时隶属于多个科室。
- **“左树右表”布局**：
  - **左侧**：组织架构树，展示医院和科室的层级，支持科室节点的拖拽排序与移动。
  - **右侧**：选定节点下的人员列表，支持递归展示（选中父科室时，显示所有子孙科室的医生）并按科室名称（遵循排序权重）进行分组展示。
- **人员归属管理**：支持将医生分配至特定科室，或从科室中移除归属，而非简单的物理移动。
- **数据平滑迁移**：提供 Migration 脚本，将现有的医生科室关系迁移至新的多对多模型。

## Capabilities

### New Capabilities
- `org-structure-tree-nav`: 提供左侧树形导航，支持科室层级查询与拖拽维护。
- `multi-dept-staff-management`: 实现医生与科室的多对多关联管理，支持跨科室调配。
- `recursive-staff-list`: 根据选中的树节点递归聚合下属所有层级的人员数据，并按科室分组。

### Modified Capabilities
- 无：本变更为全新设计的组织架构管理体系。

## Impact

- **Database**:
  - `doctors` 表：删除 `department_id` 字段。
  - `doctor_departments` 表：新增关联表，包含 `doctor_id`, `department_id` 及可选的 `is_primary` 字段。
- **Backend**:
  - `internal/model/doctor.go`: 更新模型定义。
  - `internal/service/department.go`: 核心业务逻辑重写，支持递归聚合人员。
  - `internal/handler/department.go`: 暴露树查询及成员管理 API。
- **Frontend**:
  - `src/features/sys-org`: 全新模块，实现分栏布局、可拖拽树及分组列表。
