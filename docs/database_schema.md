# 《医院全科随访系统》数据库设计文档

基于产品说明书和功能规格文档，设计完整的数据库表结构。

---

## 目录

1. [系统管理模块](#1-系统管理模块-system-management)
2. [患者主数据管理](#2-患者主数据管理-patient-management)
3. [随访计划模板库](#3-随访计划模板库-follow-up-templates)
4. [任务调度与监控](#4-任务调度与监控-task-scheduling)
5. [消息推送管理](#5-消息推送管理-message-push)
6. [字典与基础数据](#6-字典与基础数据-dictionary-data)

---

## 1. 系统管理模块 (System Management)

### 1.1 组织架构与用户

#### departments (科室表)

存储医院科室层级结构信息。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| parent_id | BIGINT | - | NULLABLE, INDEX | NULL | 上级科室ID，根节点为NULL |
| code | VARCHAR | 30 | UNIQUE, NOT NULL | - | 科室编码，院内唯一 |
| name | VARCHAR | 50 | NOT NULL | - | 科室名称 |
| description | VARCHAR | 200 | NULLABLE | NULL | 科室描述 |
| manager_id | BIGINT | - | NULLABLE, INDEX | NULL | 负责人/管理员ID，关联doctors表 |
| phone | VARCHAR | 20 | NULLABLE | NULL | 科室联系电话 |
| sort_order | INT | - | NOT NULL | 0 | 排序序号，数值越小越靠前 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-禁用，1-启用 |
| level | TINYINT | - | NOT NULL | 1 | 层级深度：1-5级 |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted_at | DATETIME | - | NULLABLE, INDEX | NULL | 软删除时间 |

**索引**：idx_parent_id, idx_status, idx_manager_id, idx_deleted_at

---

#### users (系统用户表)

存储系统登录用户信息。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| username | VARCHAR | 30 | UNIQUE, NOT NULL | - | 登录账号，字母/数字/下划线 |
| password_hash | VARCHAR | 255 | NOT NULL | - | 密码哈希值 |
| real_name | VARCHAR | 50 | NOT NULL | - | 用户真实姓名 |
| phone | VARCHAR | 11 | UNIQUE, NOT NULL | - | 手机号，全系统唯一 |
| email | VARCHAR | 100 | NULLABLE | NULL | 邮箱地址 |
| employee_no | VARCHAR | 30 | NULLABLE | NULL | 工号 |
| department_id | BIGINT | - | NULLABLE, INDEX | NULL | 所属科室ID |
| remark | VARCHAR | 200 | NULLABLE | NULL | 用户备注 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-禁用，1-启用 |
| last_login_at | DATETIME | - | NULLABLE | NULL | 最后登录时间 |
| last_login_ip | VARCHAR | 40 | NULLABLE | NULL | 最后登录IP |
| creator_id | BIGINT | - | NULLABLE | NULL | 创建人ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted_at | DATETIME | - | NULLABLE, INDEX | NULL | 软删除时间 |

**索引**：idx_username, idx_phone, idx_department_id, idx_status, idx_deleted_at

---

#### doctors (医生/员工档案表)

存储医生详细信息，与users表一对一或一对多关联。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| user_id | BIGINT | - | UNIQUE, NULLABLE, INDEX | NULL | 关联的系统用户ID |
| real_name | VARCHAR | 50 | NOT NULL | - | 医生真实姓名 |
| phone | VARCHAR | 11 | UNIQUE, NOT NULL | - | 手机号，登录名 |
| department_id | BIGINT | - | NOT NULL, INDEX | - | 所属科室ID |
| title | VARCHAR | 50 | NULLABLE | NULL | 职称（主任医师/副主任医师等） |
| specialty | VARCHAR | 200 | NULLABLE | NULL | 擅长领域 |
| introduction | TEXT | - | NULLABLE | NULL | 医生简介 |
| avatar_url | VARCHAR | 255 | NULLABLE | NULL | 头像URL |
| employee_no | VARCHAR | 30 | NULLABLE | NULL | 工号 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-离职，1-在职 |
| creator_id | BIGINT | - | NULLABLE | NULL | 创建人ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted_at | DATETIME | - | NULLABLE, INDEX | NULL | 软删除时间 |

**索引**：idx_user_id, idx_phone, idx_department_id, idx_status, idx_deleted_at

---

### 1.2 权限管理 (RBAC)

#### roles (角色表)

存储系统角色定义。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| name | VARCHAR | 50 | UNIQUE, NOT NULL | - | 角色名称，如"随访专员" |
| description | VARCHAR | 200 | NULLABLE | NULL | 角色描述 |
| data_scope | TINYINT | - | NOT NULL | 1 | 数据范围：1-全部，2-本部门，3-本人，4-自定义 |
| is_system | TINYINT | - | NOT NULL | 0 | 是否系统内置角色：0-否，1-是 |
| creator_id | BIGINT | - | NULLABLE | NULL | 创建人ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_is_system

---

#### permissions (权限条目表)

存储系统权限定义，支持菜单、按钮、接口级别权限。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| parent_id | BIGINT | - | NULLABLE, INDEX | NULL | 上级权限ID，根节点为NULL |
| name | VARCHAR | 50 | NOT NULL | - | 权限名称，如"删除患者" |
| code | VARCHAR | 100 | UNIQUE, NOT NULL | - | 权限标识，如 `patient:delete` |
| type | TINYINT | - | NOT NULL | 1 | 类型：1-目录，2-菜单，3-按钮，4-接口 |
| path | VARCHAR | 200 | NULLABLE | NULL | 路由路径（菜单类型） |
| component | VARCHAR | 200 | NULLABLE | NULL | 组件路径（菜单类型） |
| icon | VARCHAR | 50 | NULLABLE | NULL | 图标标识 |
| sort_order | INT | - | NOT NULL | 0 | 排序序号 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-禁用，1-启用 |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_parent_id, idx_type, idx_status, idx_code

---

#### user_roles (用户-角色关联表)

存储用户与角色的多对多关系。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| user_id | BIGINT | - | NOT NULL, PRIMARY KEY | - | 用户ID |
| role_id | BIGINT | - | NOT NULL, PRIMARY KEY | - | 角色ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |

**联合主键**：(user_id, role_id)

---

#### role_permissions (角色-权限关联表)

存储角色与权限的多对多关系。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| role_id | BIGINT | - | NOT NULL, PRIMARY KEY | - | 角色ID |
| permission_id | BIGINT | - | NOT NULL, PRIMARY KEY | - | 权限ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |

**联合主键**：(role_id, permission_id)

---

#### role_departments (角色-数据权限部门关联表)

当角色数据范围为"自定义"时，指定可访问的部门。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| role_id | BIGINT | - | NOT NULL, PRIMARY KEY | - | 角色ID |
| department_id | BIGINT | - | NOT NULL, PRIMARY KEY | - | 部门ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |

**联合主键**：(role_id, department_id)

---

### 1.3 系统配置与日志

#### sys_configs (全局配置表)

存储系统全局配置参数。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| config_key | VARCHAR | 50 | UNIQUE, NOT NULL | - | 配置键，如 `sys_name`, `logo_url` |
| config_value | TEXT | - | NULLABLE | NULL | 配置值 |
| description | VARCHAR | 200 | NULLABLE | NULL | 配置说明 |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_config_key

---

#### operation_logs (操作日志表)

存储用户操作审计日志。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| user_id | BIGINT | - | NULLABLE, INDEX | NULL | 操作人员ID |
| username | VARCHAR | 30 | NULLABLE | NULL | 操作人员账号 |
| real_name | VARCHAR | 50 | NULLABLE | NULL | 操作人员姓名 |
| action | VARCHAR | 50 | NOT NULL | - | 操作动作，如"创建"、"删除" |
| module | VARCHAR | 50 | NOT NULL | - | 目标模块，如"用户管理" |
| ip_address | VARCHAR | 40 | NULLABLE | NULL | IP地址 |
| request_method | VARCHAR | 10 | NULLABLE | NULL | 请求方法：GET/POST/PUT/DELETE |
| request_url | VARCHAR | 500 | NULLABLE | NULL | 请求URL |
| request_params | TEXT | - | NULLABLE | NULL | 请求参数，JSON格式 |
| response_data | TEXT | - | NULLABLE | NULL | 响应数据，JSON格式 |
| execution_time | INT | - | NULLABLE | NULL | 执行耗时（毫秒） |
| details | TEXT | - | NULLABLE | NULL | 操作详情内容，JSON格式 |
| status | TINYINT | - | NOT NULL | 1 | 操作状态：0-失败，1-成功 |
| error_msg | TEXT | - | NULLABLE | NULL | 错误信息 |
| created_at | DATETIME | - | NOT NULL, INDEX | CURRENT_TIMESTAMP | 操作时间 |

**索引**：idx_user_id, idx_module, idx_action, idx_created_at

---

## 2. 患者主数据管理 (Patient Management)

### 2.1 患者档案

#### patients (患者基础信息表)

存储患者核心档案信息。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| patient_no | VARCHAR | 20 | UNIQUE, NOT NULL | - | 院内病案号/唯一标识 |
| name | VARCHAR | 20 | NOT NULL | - | 患者姓名 |
| id_card | VARCHAR | 18 | UNIQUE, NOT NULL | - | 身份证号 |
| gender | TINYINT | - | NOT NULL | 0 | 性别：0-未知，1-男，2-女 |
| birthday | DATE | - | NULLABLE | NULL | 出生日期 |
| age | INT | - | NULLABLE | NULL | 年龄（实时计算或缓存） |
| phone | VARCHAR | 11 | NOT NULL | - | 手机号码 |
| backup_phone | VARCHAR | 11 | NULLABLE | NULL | 备用联系电话 |
| disease_type_id | BIGINT | - | NULLABLE, INDEX | NULL | 主诊断病种ID |
| surgery_type_id | BIGINT | - | NULLABLE, INDEX | NULL | 手术类型ID |
| surgery_time | DATETIME | - | NULLABLE | NULL | 手术时间 |
| admission_no | VARCHAR | 20 | NULLABLE | NULL | 住院号 |
| attending_doctor_id | BIGINT | - | NULLABLE, INDEX | NULL | 主管医生ID |
| source | TINYINT | - | NOT NULL | 3 | 数据来源：1-HIS同步，2-手工导入，3-手动创建 |
| address | VARCHAR | 200 | NULLABLE | NULL | 家庭住址 |
| allergy_history | TEXT | - | NULLABLE | NULL | 过敏史 |
| emergency_contact | VARCHAR | 20 | NULLABLE | NULL | 紧急联系人 |
| emergency_phone | VARCHAR | 11 | NULLABLE | NULL | 紧急联系人电话 |
| creator_id | BIGINT | - | NULLABLE, INDEX | NULL | 建档人ID |
| created_at | DATETIME | - | NOT NULL, INDEX | CURRENT_TIMESTAMP | 建档时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted_at | DATETIME | - | NULLABLE, INDEX | NULL | 软删除时间 |

**索引**：idx_patient_no, idx_id_card, idx_phone, idx_disease_type_id, idx_attending_doctor_id, idx_surgery_time, idx_source, idx_created_at

---

### 2.2 患者分组与扩展属性

#### patient_groups (患者分组表)

存储患者分组定义，支持静态和动态分组。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| name | VARCHAR | 100 | NOT NULL | - | 分组名称 |
| group_type | TINYINT | - | NOT NULL | 1 | 类型：1-静态，2-动态 |
| description | VARCHAR | 500 | NULLABLE | NULL | 分组描述 |
| rule_content | JSON | - | NULLABLE | NULL | 动态分组条件规则，JSON格式 |
| member_count | INT | - | NOT NULL | 0 | 成员数量（动态分组自动更新） |
| creator_id | BIGINT | - | NULLABLE | NULL | 创建人ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted_at | DATETIME | - | NULLABLE, INDEX | NULL | 软删除时间 |

**索引**：idx_group_type, idx_deleted_at

---

#### group_members (静态分组成员表)

存储静态分组的成员关系。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| group_id | BIGINT | - | NOT NULL, INDEX | - | 分组ID |
| patient_id | BIGINT | - | NOT NULL, INDEX | - | 患者ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |

**唯一索引**：uk_group_patient (group_id, patient_id)

---

#### custom_fields (自定义字段定义表)

存储各模块的自定义字段定义。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| module_type | TINYINT | - | NOT NULL | 1 | 目标模块：1-患者，2-随访 |
| field_name | VARCHAR | 50 | NOT NULL | - | 字段英文标识，如"allergy_detail" |
| field_label | VARCHAR | 50 | NOT NULL | - | 展示名称，如"过敏史详细" |
| field_type | TINYINT | - | NOT NULL | 1 | 字段类型：1-文本，2-数字，3-日期，4-单选，5-多选，6-布尔 |
| field_options | JSON | - | NULLABLE | NULL | 选项配置（单选/多选时使用） |
| is_required | TINYINT | - | NOT NULL | 0 | 是否必填：0-否，1-是 |
| sort_order | INT | - | NOT NULL | 0 | 排序序号 |
| is_visible_doctor | TINYINT | - | NOT NULL | 1 | 医生端可见：0-不可见，1-可见 |
| is_editable_doctor | TINYINT | - | NOT NULL | 1 | 医生端可编辑：0-不可编辑，1-可编辑 |
| is_visible_patient | TINYINT | - | NOT NULL | 0 | 患者端可见：0-不可见，1-可见 |
| is_editable_patient | TINYINT | - | NOT NULL | 0 | 患者端可编辑：0-不可编辑，1-可编辑 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-禁用，1-启用 |
| creator_id | BIGINT | - | NULLABLE | NULL | 创建人ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_module_type, idx_field_name, idx_status

---

#### patient_custom_values (患者自定义字段值表)

存储患者自定义字段的实际值。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| patient_id | BIGINT | - | NOT NULL, INDEX | - | 患者ID |
| field_id | BIGINT | - | NOT NULL | - | 字段ID |
| field_value | TEXT | - | NULLABLE | NULL | 字段值 |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**唯一索引**：uk_patient_field (patient_id, field_id)

---

## 3. 随访计划模板库 (Follow-up Templates)

### 3.1 模板与问卷

#### follow_up_templates (随访模板表)

存储随访计划模板定义。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| name | VARCHAR | 100 | NOT NULL | - | 模板名称 |
| disease_type_id | BIGINT | - | NULLABLE, INDEX | NULL | 关联病种分类ID |
| department_id | BIGINT | - | NULLABLE, INDEX | NULL | 所属科室ID，NULL表示全院通用 |
| description | TEXT | - | NULLABLE | NULL | 模板描述 |
| version | VARCHAR | 10 | NOT NULL | "1.0" | 版本号 |
| status | TINYINT | - | NOT NULL | 1 | 状态：1-草稿，2-已发布，3-停用 |
| is_builtin | TINYINT | - | NOT NULL | 0 | 是否内置模板：0-否，1-是 |
| creator_id | BIGINT | - | NULLABLE | NULL | 创建人ID |
| publisher_id | BIGINT | - | NULLABLE | NULL | 发布人ID |
| published_at | DATETIME | - | NULLABLE | NULL | 发布时间 |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| deleted_at | DATETIME | - | NULLABLE, INDEX | NULL | 软删除时间 |

**索引**：idx_disease_type_id, idx_department_id, idx_status, idx_is_builtin

---

#### questionnaires (问卷/量表设计表)

存储问卷或量表的定义。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| template_id | BIGINT | - | NOT NULL, INDEX | - | 关联模板ID |
| title | VARCHAR | 100 | NOT NULL | - | 问卷标题 |
| subtitle | VARCHAR | 200 | NULLABLE | NULL | 副标题/说明 |
| form_schema | JSON | - | NOT NULL | - | 表单定义，JSON结构，含题型、必填逻辑等 |
| total_score | INT | - | NULLABLE | NULL | 总分（量表类问卷） |
| estimated_time | INT | - | NULLABLE | NULL | 预计填写时长（分钟） |
| sort_order | INT | - | NOT NULL | 0 | 排序序号 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-禁用，1-启用 |
| creator_id | BIGINT | - | NULLABLE | NULL | 创建人ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_template_id, idx_status

---

### 3.2 规则引擎

#### follow_up_rules (随访规则表)

存储随访计划的触发规则和条件。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| template_id | BIGINT | - | NOT NULL, INDEX | - | 关联模板ID |
| rule_name | VARCHAR | 50 | NOT NULL | - | 规则名称 |
| trigger_event | TINYINT | - | NOT NULL | 1 | 触发事件：1-出院后，2-手术后，3-建档后，4-定时触发 |
| trigger_offset_days | INT | - | NOT NULL | 0 | 触发偏移天数 |
| trigger_time | TIME | - | NULLABLE | NULL | 触发时间点（定时触发时使用） |
| condition_logic | JSON | - | NULLABLE | NULL | 执行条件，JSON格式，如{"score": ">10"} |
| action_type | TINYINT | - | NOT NULL | 1 | 触发动作：1-发送问卷，2-创建人工随访任务，3-发送提醒 |
| target_questionnaire_id | BIGINT | - | NULLABLE | NULL | 目标问卷ID（发送问卷时使用） |
| priority | TINYINT | - | NOT NULL | 1 | 优先级：1-低，2-中，3-高 |
| sort_order | INT | - | NOT NULL | 0 | 排序序号 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-禁用，1-启用 |
| creator_id | BIGINT | - | NULLABLE | NULL | 创建人ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_template_id, idx_trigger_event, idx_status, idx_action_type

---

## 4. 任务调度与监控 (Task Scheduling)

#### follow_up_tasks (随访任务表)

存储具体的随访任务实例。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| task_no | VARCHAR | 20 | UNIQUE, NOT NULL | - | 任务编号 |
| patient_id | BIGINT | - | NOT NULL, INDEX | - | 对应患者ID |
| template_id | BIGINT | - | NOT NULL, INDEX | NULL | 使用的随访模板ID |
| rule_id | BIGINT | - | NULLABLE, INDEX | NULL | 触发的规则ID |
| questionnaire_id | BIGINT | - | NULLABLE, INDEX | NULL | 关联问卷ID |
| doctor_id | BIGINT | - | NULLABLE, INDEX | NULL | 被分配的医生ID |
| task_type | TINYINT | - | NOT NULL | 1 | 任务类型：1-自动问卷，2-人工随访 |
| plan_time | DATETIME | - | NOT NULL, INDEX | - | 计划执行时间 |
| actual_time | DATETIME | - | NULLABLE | NULL | 实际执行时间 |
| status | TINYINT | - | NOT NULL | 1 | 状态：1-待办，2-进行中，3-已完成，4-已逾期，5-异常，6-已取消 |
| result_score | INT | - | NULLABLE | NULL | 随访结果得分 |
| result_data | JSON | - | NULLABLE | NULL | 随访填写的表单结果 |
| feedback_content | TEXT | - | NULLABLE | NULL | 患者反馈内容 |
| alert_level | TINYINT | - | NOT NULL | 0 | 预警级别：0-无，1-低，2-中，3-高 |
| alert_reason | VARCHAR | 200 | NULLABLE | NULL | 预警原因 |
| remark | VARCHAR | 500 | NULLABLE | NULL | 备注 |
| creator_id | BIGINT | - | NULLABLE | NULL | 创建人ID |
| created_at | DATETIME | - | NOT NULL, INDEX | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| completed_at | DATETIME | - | NULLABLE | NULL | 完成时间 |

**索引**：idx_patient_id, idx_doctor_id, idx_template_id, idx_status, idx_plan_time, idx_alert_level, idx_created_at

---

#### task_alerts (任务异常预警表)

存储任务异常预警记录及处理状态。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| task_id | BIGINT | - | NOT NULL, INDEX | - | 关联的任务ID |
| alert_type | TINYINT | - | NOT NULL | 1 | 预警类型：1-逾期，2-患者反馈异常，3-评分异常 |
| alert_reason | VARCHAR | 200 | NOT NULL | - | 预警原因描述 |
| alert_level | TINYINT | - | NOT NULL | 2 | 预警级别：1-低，2-中，3-高 |
| original_doctor_id | BIGINT | - | NULLABLE | NULL | 原分配医生ID |
| new_doctor_id | BIGINT | - | NULLABLE | NULL | 重新分配后的医生ID |
| status | TINYINT | - | NOT NULL | 1 | 处理状态：1-未处理，2-处理中，3-已处理 |
| handler_id | BIGINT | - | NULLABLE | NULL | 处理人ID |
| handle_result | TEXT | - | NULLABLE | NULL | 处理结果 |
| handled_at | DATETIME | - | NULLABLE | NULL | 处理时间 |
| created_at | DATETIME | - | NOT NULL, INDEX | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_task_id, idx_status, idx_alert_level, idx_created_at

---

#### task_reassignments (任务重新分配记录表)

存储任务重新分配的历史记录。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| task_id | BIGINT | - | NOT NULL, INDEX | - | 任务ID |
| from_doctor_id | BIGINT | - | NOT NULL | - | 原医生ID |
| to_doctor_id | BIGINT | - | NOT NULL | - | 新医生ID |
| reason | VARCHAR | 200 | NULLABLE | NULL | 重新分配原因 |
| operator_id | BIGINT | - | NOT NULL | - | 操作人ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |

**索引**：idx_task_id, idx_from_doctor_id, idx_to_doctor_id

---

## 5. 消息推送管理 (Message Push)

#### notices (通知公告表)

存储系统通知公告。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| title | VARCHAR | 100 | NOT NULL | - | 标题 |
| content | TEXT | - | NOT NULL | - | 详细内容，富文本HTML |
| notice_type | TINYINT | - | NOT NULL | 1 | 公告类型：1-普通，2-重要，3-紧急 |
| publish_scope_type | TINYINT | - | NOT NULL | 1 | 发布范围类型：1-全院，2-指定科室 |
| publish_scope | JSON | - | NULLABLE | NULL | 发布的科室ID列表，JSON数组 |
| attachment_url | VARCHAR | 255 | NULLABLE | NULL | 附件URL |
| is_top | TINYINT | - | NOT NULL | 0 | 是否置顶：0-否，1-是 |
| top_expire_at | DATETIME | - | NULLABLE | NULL | 置顶过期时间 |
| view_count | INT | - | NOT NULL | 0 | 浏览次数 |
| publisher_id | BIGINT | - | NOT NULL | - | 发布人ID |
| publish_time | DATETIME | - | NULLABLE | NULL | 发布时间 |
| status | TINYINT | - | NOT NULL | 1 | 状态：1-草稿，2-已发布，3-已撤回，4-已下架 |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_publish_scope_type, idx_status, idx_is_top, idx_publish_time

---

#### user_notices (用户通知阅读记录表)

存储用户对公告的阅读状态。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| notice_id | BIGINT | - | NOT NULL, INDEX | - | 公告ID |
| user_id | BIGINT | - | NOT NULL, INDEX | - | 用户ID |
| is_read | TINYINT | - | NOT NULL | 0 | 是否已读：0-否，1-是 |
| read_at | DATETIME | - | NULLABLE | NULL | 阅读时间 |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**唯一索引**：uk_notice_user (notice_id, user_id)

---

#### message_templates (短信/消息模板表)

存储消息模板定义。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| code | VARCHAR | 50 | UNIQUE, NOT NULL | - | 模板编码 |
| name | VARCHAR | 50 | NOT NULL | - | 模板名称 |
| content | TEXT | - | NOT NULL | - | 内容模板，含占位符如{患者姓名} |
| channel | TINYINT | - | NOT NULL | 1 | 渠道：1-短信，2-小程序，3-站内信，4-邮件 |
| template_type | TINYINT | - | NOT NULL | 1 | 模板类型：1-随访提醒，2-用药提醒，3-系统通知 |
| variables | JSON | - | NULLABLE | NULL | 变量定义，JSON格式 |
| audit_status | TINYINT | - | NOT NULL | 1 | 审核状态：1-待审核，2-已通过，3-已驳回 |
| audit_remark | VARCHAR | 200 | NULLABLE | NULL | 审核备注 |
| third_party_code | VARCHAR | 50 | NULLABLE | NULL | 第三方平台模板编码 |
| description | VARCHAR | 200 | NULLABLE | NULL | 模板说明 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-禁用，1-启用 |
| creator_id | BIGINT | - | NULLABLE | NULL | 创建人ID |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_code, idx_channel, idx_audit_status, idx_template_type

---

#### push_records (推送记录日志表)

存储消息推送的发送记录。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| template_id | BIGINT | - | NOT NULL, INDEX | - | 使用的模板ID |
| business_type | TINYINT | - | NOT NULL | 1 | 业务类型：1-随访任务，2-系统通知 |
| business_id | BIGINT | - | NULLABLE | NULL | 业务ID（如任务ID） |
| receiver_type | TINYINT | - | NOT NULL | 1 | 接收者类型：1-患者，2-医生 |
| receiver_id | BIGINT | - | NOT NULL, INDEX | - | 接收者ID |
| receiver_name | VARCHAR | 50 | NULLABLE | NULL | 接收者姓名 |
| receiver_contact | VARCHAR | 50 | NOT NULL | - | 接收手机号或OpenID |
| content | TEXT | - | NOT NULL | - | 实际发送内容 |
| channel | TINYINT | - | NOT NULL | 1 | 渠道：1-短信，2-小程序，3-站内信，4-邮件 |
| send_status | TINYINT | - | NOT NULL | 1 | 发送状态：1-待发送，2-发送中，3-成功，4-失败 |
| send_time | DATETIME | - | NULLABLE | NULL | 发送时间 |
| receive_status | TINYINT | - | NULLABLE | NULL | 到达状态：1-未到达，2-已到达 |
| receive_time | DATETIME | - | NULLABLE | NULL | 到达时间 |
| is_read | TINYINT | - | NOT NULL | 0 | 是否已读：0-否，1-是 |
| read_time | DATETIME | - | NULLABLE | NULL | 阅读时间 |
| fail_reason | TEXT | - | NULLABLE | NULL | 失败原因 |
| third_party_msg_id | VARCHAR | 64 | NULLABLE | NULL | 第三方消息ID |
| retry_count | INT | - | NOT NULL | 0 | 重试次数 |
| created_at | DATETIME | - | NOT NULL, INDEX | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_template_id, idx_receiver_id, idx_send_status, idx_business_type, idx_created_at

---

## 6. 字典与基础数据 (Dictionary Data)

#### disease_types (病种分类表)

存储病种分类信息。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| parent_id | BIGINT | - | NULLABLE, INDEX | NULL | 上级分类ID |
| code | VARCHAR | 30 | UNIQUE, NOT NULL | - | 病种编码 |
| name | VARCHAR | 50 | NOT NULL | - | 病种名称 |
| description | VARCHAR | 200 | NULLABLE | NULL | 病种描述 |
| sort_order | INT | - | NOT NULL | 0 | 排序序号 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-禁用，1-启用 |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：idx_parent_id, idx_status

---

#### surgery_types (手术类型表)

存储各病种下的手术类型。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| disease_type_id | BIGINT | - | NOT NULL, INDEX | - | 所属病种ID |
| code | VARCHAR | 30 | NOT NULL | - | 手术编码 |
| name | VARCHAR | 50 | NOT NULL | - | 手术名称 |
| description | VARCHAR | 200 | NULLABLE | NULL | 手术描述 |
| sort_order | INT | - | NOT NULL | 0 | 排序序号 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-禁用，1-启用 |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**唯一索引**：uk_disease_surgery (disease_type_id, code)
**索引**：idx_disease_type_id, idx_status

---

#### titles (职称字典表)

存储医生职称字典。

| 字段名 | 类型 | 长度 | 约束 | 默认值 | 说明 |
|--------|------|------|------|--------|------|
| id | BIGINT | - | PRIMARY KEY, AUTO_INCREMENT | - | 主键ID |
| name | VARCHAR | 50 | UNIQUE, NOT NULL | - | 职称名称 |
| level | TINYINT | - | NOT NULL | 1 | 职称等级：1-初级，2-中级，3-副高，4-正高 |
| sort_order | INT | - | NOT NULL | 0 | 排序序号 |
| status | TINYINT | - | NOT NULL | 1 | 状态：0-禁用，1-启用 |
| created_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | NOT NULL | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

---

## 附录：数据库设计规范

### A. 命名规范

1. **表名**：小写字母，单词间用下划线分隔，如 `follow_up_tasks`
2. **字段名**：小写字母，单词间用下划线分隔，如 `patient_no`
3. **索引名**：
   - 主键：`PRIMARY`
   - 唯一索引：`uk_{字段名}` 或 `uk_{字段1}_{字段2}`
   - 普通索引：`idx_{字段名}`

### B. 字段类型规范

1. **主键**：使用 `BIGINT UNSIGNED AUTO_INCREMENT`
2. **状态字段**：使用 `TINYINT`，配合注释说明各值含义
3. **金额字段**：使用 `DECIMAL(10,2)`
4. **时间字段**：使用 `DATETIME`，默认值为 `CURRENT_TIMESTAMP`
5. **JSON字段**：使用 `JSON` 类型存储结构化数据
6. **软删除**：统一使用 `deleted_at DATETIME` 字段

### C. 索引设计原则

1. 主键自动创建聚簇索引
2. 外键字段必须创建索引
3. 频繁查询的条件字段创建索引
4. 排序字段创建索引
5. 避免过多索引（单表不超过5个）

### D. 数据安全

1. 敏感数据（身份证、手机号）加密存储
2. 操作日志记录完整审计信息
3. 重要操作记录变更前快照
4. 软删除代替物理删除

---

*文档版本：v1.0*
*最后更新：2026-03-04*
