package model

// DoctorDepartment 医生-科室关联表（多对多）
type DoctorDepartment struct {
	Base
	DoctorID     uint `gorm:"index:idx_dr_dept_dr_id;not null;comment:医生ID" json:"doctorId"`
	DepartmentID uint `gorm:"index:idx_dr_dept_dept_id;not null;comment:科室ID" json:"departmentId"`
	IsPrimary    bool `gorm:"not null;default:false;comment:是否为主科室" json:"isPrimary"`
}

func (DoctorDepartment) TableName() string {
	return "doctor_departments"
}
