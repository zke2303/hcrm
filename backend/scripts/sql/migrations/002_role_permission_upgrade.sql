-- 1. Upgrade roles table: Add code, status, and update data_scope
ALTER TABLE `roles` ADD COLUMN `code` varchar(50) NOT NULL COMMENT '角色编码' AFTER `name`;
ALTER TABLE `roles` ADD COLUMN `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '角色状态：0-禁用，1-启用' AFTER `data_scope`;
ALTER TABLE `roles` MODIFY COLUMN `data_scope` tinyint(1) NOT NULL DEFAULT 1 COMMENT '数据范围：1-全部，2-本机构，3-本科室，4-本人';

-- 2. Create sys_menus (SysMenu)
CREATE TABLE `sys_menus` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `parent_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0 COMMENT '父菜单ID',
  `name` varchar(50) NOT NULL COMMENT '菜单名称',
  `type` tinyint(1) NOT NULL DEFAULT 1 COMMENT '菜单类型：1-目录 2-菜单 3-按钮',
  `path` varchar(200) NULL DEFAULT NULL COMMENT '路由地址',
  `component` varchar(255) NULL DEFAULT NULL COMMENT '组件路径',
  `perms` varchar(100) NULL DEFAULT NULL COMMENT '权限标识',
  `icon` varchar(100) NULL DEFAULT NULL COMMENT '菜单图标',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '显示顺序',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '菜单状态：0-停用 1-正常',
  `visible` tinyint(1) NOT NULL DEFAULT 1 COMMENT '显示状态：0-隐藏 1-显示',
  `api_path` varchar(255) NULL DEFAULT NULL COMMENT '关联API路径',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent_id`(`parent_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '菜单权限控制表';

-- 3. Create sys_role_menus
CREATE TABLE `sys_role_menus` (
  `role_id` bigint(20) UNSIGNED NOT NULL COMMENT '角色ID',
  `menu_id` bigint(20) UNSIGNED NOT NULL COMMENT '菜单ID',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`role_id`, `menu_id`) USING BTREE,
  INDEX `idx_role_id`(`role_id`) USING BTREE,
  INDEX `idx_menu_id`(`menu_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '角色-菜单关联关系表';

-- 4. Create sys_role_depts
CREATE TABLE `sys_role_depts` (
  `role_id` bigint(20) UNSIGNED NOT NULL COMMENT '角色ID',
  `department_id` bigint(20) UNSIGNED NOT NULL COMMENT '科室ID',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  PRIMARY KEY (`role_id`, `department_id`) USING BTREE,
  INDEX `idx_role_id`(`role_id`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '角色-数据权限科室关联表';

-- 5. Initialize base data (ID=1 Superadmin)
INSERT INTO `roles` (`id`, `name`, `code`, `description`, `data_scope`, `status`, `is_system`) 
VALUES (1, '超级管理员', 'admin', '系统内置，拥有全部权限', 1, 1, 1)
ON DUPLICATE KEY UPDATE `code`='admin', `data_scope`=1, `status`=1, `is_system`=1;

-- Initialize Menus for System Management
INSERT INTO `sys_menus` (`id`, `parent_id`, `name`, `type`, `path`, `component`, `perms`, `icon`, `sort_order`) VALUES 
(1, 0, '系统管理', 1, 'system', NULL, NULL, 'settings', 100),
(2, 1, '用户管理', 2, 'user', '/system/user/index', 'sys:user:list', 'user', 1),
(3, 1, '角色管理', 2, 'role', '/system/role/index', 'sys:role:list', 'peoples', 2),
(4, 1, '菜单管理', 2, 'menu', '/system/menu/index', 'sys:menu:list', 'tree-table', 3);

-- Link Admin role to these initial menus
INSERT INTO `sys_role_menus` (`role_id`, `menu_id`) VALUES (1, 1), (1, 2), (1, 3), (1, 4)
ON DUPLICATE KEY UPDATE `role_id`=VALUES(`role_id`);
