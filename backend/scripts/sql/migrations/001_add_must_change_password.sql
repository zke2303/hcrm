-- 添加 must_change_password 字段到 users 表
-- 用于支持首次登录强制修改密码功能

ALTER TABLE `users` 
ADD COLUMN `must_change_password` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否需要修改密码：0-否，1-是' 
AFTER `creator_id`;

-- 更新现有用户，不需要强制修改密码
UPDATE `users` SET `must_change_password` = 0 WHERE `last_login_at` IS NOT NULL;