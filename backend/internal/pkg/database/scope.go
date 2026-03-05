package database

import (
	"context"

	"gorm.io/gorm"
)

// DataScope 辅助函数，用于 Repository 层应用数据权限过滤。
// userIDField: 表中关联用户 ID 的字段名（如 creator_id）
// deptIDField: 表中关联科室 ID 的字段名（如 department_id）
func DataScope(ctx context.Context, userIDField, deptIDField string) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		// 尝试从不同的 context 来源获取 (ctx 可能是 context.Context 或 *gin.Context)
		// 注意：实际执行时需确保 ctx 中包含这些值
		scope, ok := ctx.Value("dataScope").(int)
		if !ok {
			return db
		}

		userID, _ := ctx.Value("userID").(uint)
		if userID == 1 {
			return db
		}

		switch scope {
		case 1: // 全部
			return db
		case 2: // 本机构 (暂时同全部)
			return db
		case 3: // 本科室
			deptID, _ := ctx.Value("departmentID").(uint)
			if deptIDField != "" && deptID != 0 {
				return db.Where(deptIDField+" = ?", deptID)
			}
			return db.Where("1=0") // 无效配置则不返回数据
		case 4: // 本人
			if userIDField != "" && userID != 0 {
				return db.Where(userIDField+" = ?", userID)
			}
			return db.Where("1=0")
		default:
			return db.Where("1=0")
		}
	}
}
