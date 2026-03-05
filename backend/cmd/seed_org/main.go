package main

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"hcrm/backend/internal/config"
	"hcrm/backend/internal/model"
)

func main() {
	// 加载配置
	cfg, err := config.Load("")
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	// 连接数据库
	db, err := gorm.Open(mysql.Open(cfg.Database.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("连接数据库失败: %v", err)
	}

	fmt.Println("正在同步数据库表结构...")
	// 自动迁移，这会创建新的 'type' 字段
	err = db.AutoMigrate(&model.Department{})
	if err != nil {
		log.Fatalf("同步数据库表结构失败: %v", err)
	}
	fmt.Println("数据库表结构同步成功。")

	// 准备医院测试数据
	hospitals := []model.Department{
		{
			Code:      "H001",
			Name:      "第一中心医院",
			Type:      model.OrgTypeHospital,
			Status:    1,
			SortOrder: 1,
			Level:     1,
		},
		{
			Code:      "H002",
			Name:      "第二人民医院",
			Type:      model.OrgTypeHospital,
			Status:    1,
			SortOrder: 2,
			Level:     1,
		},
	}

	for i := range hospitals {
		// 检查是否已存在
		var existing model.Department
		if err := db.Where("code = ?", hospitals[i].Code).First(&existing).Error; err == nil {
			fmt.Printf("医院 %s (代码: %s) 已存在，正在更新类型和基本信息...\n", hospitals[i].Name, hospitals[i].Code)
			db.Model(&existing).Updates(map[string]interface{}{
				"type": model.OrgTypeHospital,
				"name": hospitals[i].Name,
			})
			hospitals[i].ID = existing.ID
		} else {
			if err := db.Create(&hospitals[i]).Error; err != nil {
				fmt.Printf("创建医院 %s 失败: %v\n", hospitals[i].Name, err)
				continue
			}
			fmt.Printf("成功创建医院: %s (ID: %d)\n", hospitals[i].Name, hospitals[i].ID)
		}

		// 为每个医院创建科室
		depts := []model.Department{
			{
				ParentID:  &hospitals[i].ID,
				Code:      hospitals[i].Code + "-D01",
				Name:      "内科",
				Type:      model.OrgTypeDepartment,
				Status:    1,
				SortOrder: 1,
				Level:     2,
			},
			{
				ParentID:  &hospitals[i].ID,
				Code:      hospitals[i].Code + "-D02",
				Name:      "外科",
				Type:      model.OrgTypeDepartment,
				Status:    1,
				SortOrder: 2,
				Level:     2,
			},
			{
				ParentID:  &hospitals[i].ID,
				Code:      hospitals[i].Code + "-D03",
				Name:      "妇产科",
				Type:      model.OrgTypeDepartment,
				Status:    1,
				SortOrder: 3,
				Level:     2,
			},
		}

		for j := range depts {
			var existingDept model.Department
			if err := db.Where("code = ?", depts[j].Code).First(&existingDept).Error; err == nil {
				fmt.Printf("  科室 %s 已存在，更新父节点和类型...\n", depts[j].Name)
				db.Model(&existingDept).Updates(map[string]interface{}{
					"type":      model.OrgTypeDepartment,
					"parent_id": depts[j].ParentID,
				})
			} else {
				if err := db.Create(&depts[j]).Error; err != nil {
					fmt.Printf("  创建科室 %s 失败: %v\n", depts[j].Name, err)
				} else {
					fmt.Printf("  成功创建科室: %s (ID: %d)\n", depts[j].Name, depts[j].ID)
				}
			}
		}
	}
}
