package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"hcrm/backend/internal/repository"
	"hcrm/backend/internal/service"
)

func main() {
	dsn := "root:123@tcp(119.91.27.214:3306)/hcrm?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect: %v", err)
	}

	deptRepo := repository.NewDepartmentRepository(db)
	doctorRepo := repository.NewDoctorRepository(db)
	deptSvc := service.NewDepartmentService(deptRepo, doctorRepo)

	tree, err := deptSvc.GetFullTree(context.Background())
	if err != nil {
		log.Fatalf("get tree error: %v", err)
	}

	bytes, _ := json.MarshalIndent(tree, "", "  ")
	fmt.Println(string(bytes))

	// Get raw depts
	depts, _ := deptRepo.FindAll(context.Background())
	fmt.Printf("\nRaw depts count: %d\n", len(depts))
	for _, d := range depts {
		pid := "nil"
		if d.ParentID != nil {
			pid = fmt.Sprintf("%d", *d.ParentID)
		}
		fmt.Printf("id=%d parent=%s name=%s deletedAt=%v\n", d.ID, pid, d.Name, d.DeletedAt)
	}
}
