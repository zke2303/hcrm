package main

import (
	"fmt"

	"hcrm/backend/internal/model"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := "root:123@tcp(119.91.27.214:3306)/hcrm?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Printf("Connect to DB failed: %v\n", err)
		return
	}
	fmt.Println("Connect to DB success")

	// 0. Auto Migrate
	err = db.AutoMigrate(
		&model.Department{},
		&model.User{},
		&model.Role{},
		&model.UserRole{},
		&model.Title{},
	)
	if err != nil {
		fmt.Printf("AutoMigrate failed: %v\n", err)
		return
	}
	fmt.Println("AutoMigrate completed")

	// 1. Create Department
	dept := model.Department{
		Base:   model.Base{ID: 1},
		Name:   "随访管理中心",
		Code:   "DEP0001",
		Status: 1,
		Level:  1,
	}
	db.FirstOrCreate(&dept, model.Department{Base: model.Base{ID: 1}})
	fmt.Println("Department initialized")

	// 2. Create Role
	role := model.Role{
		ID:          1,
		Name:        "超级管理员",
		Code:        "super_admin",
		Description: "拥有系统所有权限",
		IsSystem:    1,
		DataScope:   1, // 全部
		Status:      1,
	}
	db.FirstOrCreate(&role, model.Role{ID: 1})
	fmt.Println("Role initialized")

	// 3. Create Users
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)

	users := []model.User{
		{
			Base:               model.Base{ID: 1},
			Username:           "admin",
			PasswordHash:       string(hashedPassword),
			RealName:           "系统管理员",
			Phone:              "13800000000",
			EmployeeNo:         "EMP00001",
			DepartmentID:       getUintPtr(1),
			Status:             1,
			MustChangePassword: true,
		},
		{
			Base:               model.Base{ID: 2},
			Username:           "doctor01",
			PasswordHash:       string(hashedPassword),
			RealName:           "张三丰",
			Phone:              "13800000001",
			EmployeeNo:         "EMP00002",
			DepartmentID:       getUintPtr(1),
			Status:             1,
			MustChangePassword: true,
		},
		{
			Base:               model.Base{ID: 3},
			Username:           "nurse01",
			PasswordHash:       string(hashedPassword),
			RealName:           "李小翠",
			Phone:              "13800000002",
			EmployeeNo:         "EMP00003",
			DepartmentID:       getUintPtr(1),
			Status:             1,
			MustChangePassword: true,
		},
	}

	for _, user := range users {
		db.FirstOrCreate(&user, model.User{Username: user.Username})
		fmt.Printf("User %s initialized\n", user.Username)
	}

	// 4. Associate admin with role
	userRole := model.UserRole{
		UserID: 1,
		RoleID: 1,
	}
	db.FirstOrCreate(&userRole, model.UserRole{UserID: 1, RoleID: 1})
	fmt.Println("Admin role association initialized")

	// 5. Create Titles
	titles := []model.Title{
		{ID: 1, Name: "主任医师", Level: 4, SortOrder: 1, Status: 1},
		{ID: 2, Name: "副主任医师", Level: 3, SortOrder: 2, Status: 1},
		{ID: 3, Name: "主治医师", Level: 2, SortOrder: 3, Status: 1},
		{ID: 4, Name: "住院医师", Level: 1, SortOrder: 4, Status: 1},
		{ID: 5, Name: "主任护师", Level: 4, SortOrder: 5, Status: 1},
		{ID: 6, Name: "副主任护师", Level: 3, SortOrder: 6, Status: 1},
		{ID: 7, Name: "主管护师", Level: 2, SortOrder: 7, Status: 1},
		{ID: 8, Name: "护师", Level: 1, SortOrder: 8, Status: 1},
		{ID: 9, Name: "护士", Level: 1, SortOrder: 9, Status: 1},
	}
	for _, t := range titles {
		db.FirstOrCreate(&t, model.Title{ID: t.ID})
		fmt.Printf("Title %s initialized\n", t.Name)
	}

	fmt.Println("Seeding completed successfully")
}

func getUintPtr(v uint) *uint {
	return &v
}
