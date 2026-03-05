-- Add Organization Management menu to System Management
-- Insert organization management menu as the first item under System Management (parent_id=1)

INSERT INTO `sys_menus` (`id`, `parent_id`, `name`, `type`, `path`, `component`, `perms`, `icon`, `sort_order`, `status`, `visible`)
VALUES (5, 1, '机构管理', 2, 'org', '/system/org/index', 'sys:org:list', 'building-2', 0, 1, 1)
ON DUPLICATE KEY UPDATE 
  `name` = '机构管理',
  `sort_order` = 0;

-- Link Admin role to the organization management menu
INSERT INTO `sys_role_menus` (`role_id`, `menu_id`)
VALUES (1, 5)
ON DUPLICATE KEY UPDATE `role_id` = VALUES(`role_id`);