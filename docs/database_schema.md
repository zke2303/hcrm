# 《医院全科随访系统》数据库设计草案

基于 `docs/hrcm-001.md` 产品说明书，设计以下数据库表结构。

## 1. 系统管理模块 (System Management)

### 1.1 组织架构与用户

- **departments (科室表)**
  - `id` (主键)
  - `parent_id` (上级科室ID，用于构建树形结构)
  - `name` (科室名称)
  - `description` (科室描述)
  - `manager_id` (负责人/管理员ID)
  - `sort_order` (排序)
  - `created_at`, `updated_at`, `deleted_at`
- **users (系统用户表)**
  - `id` (主键)
  - `username` (登录账号)
  - `password_hash` (密码哈希)
  - `status` (状态：启用、禁用)
  - `created_at`, `updated_at`, `deleted_at`
- **doctors (医生/员工档案表)**
  - `id` (主键)
  - `user_id` (关联的系统用户ID，可为空)
  - `real_name` (医生/员工真实姓名)
  - `phone` (联系电话)
  - `department_id` (所属科室ID)
  - `title` (职称)
  - `created_at`, `updated_at`, `deleted_at`

### 1.2 权限管理 (RBAC)

- **roles (角色表)**
  - `id` (主键)
  - `name` (角色名称，如“随访专员”)
  - `description` (角色描述)
  - `created_at`, `updated_at`
- **permissions (权限条目表)**
  - `id` (主键)
  - `parent_id` (上级权限)
  - `name` (权限名称，如“删除患者”)
  - `code` (权限标识，如 `patient:delete`)
  - `type` (类型：菜单、按钮、数据范围)
  - `created_at`, `updated_at`
- **user_roles (用户-角色关联表)**
  - `user_id` (用户ID)
  - `role_id` (角色ID)
- **role_permissions (角色-权限关联表)**
  - `role_id` (角色ID)
  - `permission_id` (权限ID)

### 1.3 系统配置与日志

- **sys_configs (全局配置表)**
  - `id` (主键)
  - `config_key` (配置键，如 `sys_name`, `logo_url`)
  - `config_value` (配置值)
  - `description` (配置说明)
  - `created_at`, `updated_at`
- **operation_logs (操作日志表)**
  - `id` (主键)
  - `user_id` (操作人员ID)
  - `action` (操作动作)
  - `module` (目标模块)
  - `ip_address` (IP地址)
  - `details` (操作详情内容，JSON)
  - `created_at` (操作时间)

---

## 2. 患者主数据管理 (Patient Management)

### 2.1 患者档案

- **patients (患者基础信息表)**
  - `id` (主键)
  - `patient_no` (院内病案号/唯一标识)
  - `name` (姓名，2-20字符)
  - `id_card` (身份证号，18位)
  - `gender` (性别，基于身份证自动识别：男/女/未知)
  - `birthday` (出生日期，基于身份证自动识别)
  - `phone` (手机号码，11位)
  - `disease_type_id` (主诊断病种，关联疾病字典表)
  - `backup_phone` (备用联系电话，11位)
  - `surgery_type_id` (手术类型，关联病种的手术字典)
  - `surgery_time` (手术时间)
  - `admission_no` (住院号，1-20字符)
  - `attending_doctor_id` (主管医生，关联 `doctors` 表)
  - `source` (数据来源：HIS同步、手工导入、手动创建)
  - `creator_id` (建档人ID，关联 `users` 表)
  - `created_at` (建档时间), `updated_at`, `deleted_at`

### 2.2 患者分组与扩展属性

- **patient_groups (患者分组表)**
  - `id` (主键)
  - `name` (分组名称，如“2023年Q4膝关节置换术后患者”)
  - `group_type` (类型：静态、动态)
  - `rule_content` (动态分组条件规则，JSON格式)
  - `created_at`, `updated_at`
- **group_members (静态分组成员表)**
  - `group_id` (分组ID)
  - `patient_id` (患者ID)
- **custom_fields (自定义字段定义表)**
  - `id` (主键)
  - `module_type` (目标模块，针对患者、随访等)
  - `field_name` (字段英文标识)
  - `field_label` (展示名称，如“过敏史详细”)
  - `field_type` (字段类型：文本、日期、枚举等)
  - `is_visible_doctor`, `is_visible_patient` (可见性控制)
  - `created_at`, `updated_at`
- **patient_custom_values (患者自定义字段值表)**
  - `patient_id` (患者ID)
  - `field_id` (字段ID)
  - `field_value` (字段值)

---

## 3. 随访计划模板库 (Follow-up Templates)

### 3.1 模板与问卷

- **follow_up_templates (随访模板表)**
  - `id` (主键)
  - `name` (模板名称)
  - `disease_type` (关联病种分类)
  - `department_id` (所属科室，NULL表示全院通用)
  - `status` (状态：草稿、已发布、停用)
  - `created_at`, `updated_at`
- **questionnaires (问卷/量表设计表)**
  - `id` (主键)
  - `template_id` (关联模板ID)
  - `title` (问卷标题)
  - `form_schema` (表单定义，拖拽生成的JSON结构，含题型、必填逻辑等)
  - `created_at`, `updated_at`

### 3.2 规则引擎

- **follow_up_rules (随访规则表)**
  - `id` (主键)
  - `template_id` (关联模板ID)
  - `trigger_event` (触发事件，如“出院后”)
  - `trigger_offset_days` (触发偏移天数，如出院后 3 天)
  - `condition_logic` (执行条件，如评分 > 10，JSON)
  - `action_type` (触发动作：发送问卷、创建人工随访等)
  - `created_at`, `updated_at`

---

## 4. 任务调度与监控 (Task Scheduling)

- **follow_up_tasks (随访任务表)**
  - `id` (主键)
  - `patient_id` (对应患者)
  - `template_id` (使用的随访模板)
  - `doctor_id` (被分配的医生/团队ID)
  - `task_type` (任务类型：自动问卷、人工随访)
  - `plan_time` (计划执行时间)
  - `status` (状态：待办、已完成、已逾期、异常)
  - `result_score` (随访结果得分)
  - `result_data` (随访填写的表单结果，JSON)
  - `created_at`, `updated_at`
- **task_alerts (任务异常预警表)**
  - `id` (主键)
  - `task_id` (关联的异常任务)
  - `alert_reason` (预警原因：逾期、上报剧痛等)
  - `status` (处理状态：未处理、已重新分配并处理)
  - `created_at`

---

## 5. 消息推送管理 (Message Push)

- **notices (通知公告表)**
  - `id` (主键)
  - `title` (标题)
  - `content` (详细内容，富文本)
  - `publish_scope_type` (发布范围类型：全院、指定科室)
  - `publish_scope` (关联的科室ID等，JSON)
  - `publisher_id` (发布人ID)
  - `created_at`, `updated_at`
- **user_notices (用户通知红点表)**
  - `notice_id` (公告ID)
  - `user_id` (用户ID)
  - `is_read` (是否已读)
  - `read_at` (阅读时间)
- **message_templates (短信/消息模板表)**
  - `id` (主键)
  - `code` (模板编码)
  - `content` (内容模板，含占位符)
  - `channel` (渠道：短信、小程序、站内信)
  - `status` (审核状态)
  - `created_at`, `updated_at`
- **push_records (推送记录日志表)**
  - `id` (主键)
  - `message_template_id` (使用的模板ID)
  - `receiver_id` (接收者用户/患者ID)
  - `receiver_contact` (接收手机号或OpenID)
  - `status` (发送状态、到达状态)
  - `is_read` (是否已阅读)
  - `created_at` (推送时间)
