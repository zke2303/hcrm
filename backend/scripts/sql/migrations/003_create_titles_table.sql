-- 6. Create titles (职称字典表)
CREATE TABLE `titles` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(50) NOT NULL COMMENT '职称名称',
  `level` tinyint(4) NOT NULL DEFAULT 1 COMMENT '职称等级：1-初级，2-中级，3-副高，4-正高',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序序号',
  `status` tinyint(4) NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updated_at` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_name`(`name`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '职称字典表';

-- 7. Initialize Title Data
INSERT INTO `titles` (`name`, `level`, `sort_order`, `status`) VALUES 
('主任医师', 4, 1, 1),
('副主任医师', 3, 2, 1),
('主治医师', 2, 3, 1),
('住院医师', 1, 4, 1),
('主任护师', 4, 5, 1),
('副主任护师', 3, 6, 1),
('主管护师', 2, 7, 1),
('护师', 1, 8, 1),
('护士', 1, 9, 1);
