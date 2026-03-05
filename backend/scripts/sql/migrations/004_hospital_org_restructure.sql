-- ----------------------------
-- Table structure for doctor_departments
-- ----------------------------
CREATE TABLE `doctor_departments`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `doctor_id` bigint(20) UNSIGNED NOT NULL COMMENT '医生ID',
  `department_id` bigint(20) UNSIGNED NOT NULL COMMENT '科室ID',
  `is_primary` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否为主科室：0-否，1-是',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  `deleted_at` datetime(0) NULL DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_doctor_id`(`doctor_id`) USING BTREE,
  INDEX `idx_department_id`(`department_id`) USING BTREE,
  INDEX `idx_deleted_at`(`deleted_at`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '医生-科室关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Data migration: 迁移医生现有的科室关联
-- ----------------------------
INSERT INTO `doctor_departments` (`doctor_id`, `department_id`, `is_primary`, `created_at`, `updated_at`)
SELECT `id`, `department_id`, 1, NOW(), NOW() FROM `doctors` WHERE `deleted_at` IS NULL;

-- ----------------------------
-- Finalize: 删除 doctors 表中的旧字段
-- ----------------------------
ALTER TABLE `doctors` DROP COLUMN `department_id`;
