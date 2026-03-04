SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for departments
-- ----------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `parent_id` bigint(20) NULL DEFAULT NULL COMMENT '上级科室ID，根节点为NULL',
  `code` varchar(30) NOT NULL COMMENT '科室编码，院内唯一',
  `name` varchar(50) NOT NULL COMMENT '科室名称',
  `description` varchar(200) NULL DEFAULT NULL COMMENT '科室描述',
  `manager_id` bigint(20) NULL DEFAULT NULL COMMENT '负责人/管理员ID，关联doctors表',
  `phone` varchar(20) NULL DEFAULT NULL COMMENT '科室联系电话',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序序号，数值越小越靠前',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `level` tinyint(4) NOT NULL DEFAULT 1 COMMENT '层级深度：1-5级',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted_at` datetime(0) NULL DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_manager_id`(`manager_id`) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '科室表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(30) NOT NULL COMMENT '登录账号，字母/数字/下划线',
  `password_hash` varchar(255) NOT NULL COMMENT '密码哈希值',
  `real_name` varchar(50) NOT NULL COMMENT '用户真实姓名',
  `phone` varchar(11) NOT NULL COMMENT '手机号，全系统唯一',
  `email` varchar(100) NULL DEFAULT NULL COMMENT '邮箱地址',
  `employee_no` varchar(30) NULL DEFAULT NULL COMMENT '工号',
  `department_id` bigint(20) NULL DEFAULT NULL COMMENT '所属科室ID',
  `remark` varchar(200) NULL DEFAULT NULL COMMENT '用户备注',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `last_login_at` datetime(0) NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_login_ip` varchar(40) NULL DEFAULT NULL COMMENT '最后登录IP',
  `creator_id` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `must_change_password` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否需要修改密码：0-否，1-是',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted_at` datetime(0) NULL DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE,
  UNIQUE INDEX `phone`(`phone`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '系统用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(50) NOT NULL COMMENT '角色名称，如\"随访专员\"',
  `description` varchar(200) NULL DEFAULT NULL COMMENT '角色描述',
  `data_scope` tinyint(4) NOT NULL DEFAULT 1 COMMENT '数据范围：1-全部，2-本部门，3-本人，4-自定义',
  `is_system` tinyint(4) NOT NULL DEFAULT 0 COMMENT '是否系统内置角色：0-否，1-是',
  `creator_id` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name`) USING BTREE,
  INDEX `idx_is_system`(`is_system`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `parent_id` bigint(20) NULL DEFAULT NULL COMMENT '上级权限ID，根节点为NULL',
  `name` varchar(50) NOT NULL COMMENT '权限名称，如\"删除患者\"',
  `code` varchar(100) NOT NULL COMMENT '权限标识，如 patient:delete',
  `type` tinyint(4) NOT NULL DEFAULT 1 COMMENT '类型：1-目录，2-菜单，3-按钮，4-接口',
  `path` varchar(200) NULL DEFAULT NULL COMMENT '路由路径（菜单类型）',
  `component` varchar(200) NULL DEFAULT NULL COMMENT '组件路径（菜单类型）',
  `icon` varchar(50) NULL DEFAULT NULL COMMENT '图标标识',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序序号',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at?` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_type`(`type`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '权限条目表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user_roles
-- ----------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles`  (
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT '用户ID',
  `role_id` bigint(20) UNSIGNED NOT NULL COMMENT '角色ID',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`user_id`, `role_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户-角色关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions`  (
  `role_id` bigint(20) UNSIGNED NOT NULL COMMENT '角色ID',
  `permission_id` bigint(20) UNSIGNED NOT NULL COMMENT '权限ID',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`role_id`, `permission_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '角色-权限关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for doctors
-- ----------------------------
DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NULL DEFAULT NULL COMMENT '关联的系统用户ID',
  `real_name` varchar(50) NOT NULL COMMENT '医生真实姓名',
  `phone` varchar(11) NOT NULL COMMENT '手机号，登录名',
  `department_id` bigint(20) NOT NULL COMMENT '所属科室ID',
  `title` varchar(50) NULL DEFAULT NULL COMMENT '职称（主任医师/副主任医师等）',
  `specialty` varchar(200) NULL DEFAULT NULL COMMENT '擅长领域',
  `introduction` text NULL COMMENT '医生简介',
  `avatar_url` varchar(255) NULL DEFAULT NULL COMMENT '头像URL',
  `employee_no` varchar(30) NULL DEFAULT NULL COMMENT '工号',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0-离职，1-在职',
  `creator_id` bigint(20) NULL DEFAULT NULL COMMENT '创建人ID',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted_at` datetime(0) NULL DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_id`(`user_id`) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '医生/员工档案表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for operation_logs
-- ----------------------------
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NULL DEFAULT NULL COMMENT '操作人员ID',
  `username` varchar(30) NULL DEFAULT NULL COMMENT '操作人员账号',
  `real_name` varchar(50) NULL DEFAULT NULL COMMENT '操作人员姓名',
  `action` varchar(50) NOT NULL COMMENT '操作动作，如\"创建\"、\"删除\"',
  `module` varchar(50) NOT NULL COMMENT '目标模块，如\"用户管理\"',
  `ip_address` varchar(40) NULL DEFAULT NULL COMMENT 'IP地址',
  `request_method` varchar(10) NULL DEFAULT NULL COMMENT '请求方法：GET/POST/PUT/DELETE',
  `request_url` varchar(500) NULL DEFAULT NULL COMMENT '请求URL',
  `request_params` text NULL COMMENT '请求参数，JSON格式',
  `response_data` text NULL COMMENT '响应数据，JSON格式',
  `execution_time` int(11) NULL DEFAULT NULL COMMENT '执行耗时（毫秒）',
  `details` text NULL COMMENT '操作详情内容，JSON格式',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '操作状态：0-失败，1-成功',
  `error_msg` text NULL DEFAULT NULL COMMENT '错误信息',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '操作时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_module`(`module`) USING BTREE,
  INDEX `idx_action`(`action`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '操作日志表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
