// Package converter provides tools to convert models to VOs.
package converter

import (
	"hcrm/backend/internal/model"
	"hcrm/backend/internal/schema/vo"
)

// DoctorToVO 将医生模型转换为 VO
func DoctorToVO(doctor *model.Doctor, user *model.User, dept *model.Department, roles []model.Role) *vo.DoctorVO {
	if doctor == nil {
		return nil
	}

	doctorVO := &vo.DoctorVO{
		ID:             doctor.ID,
		UserID:         *doctor.UserID,
		RealName:       doctor.RealName,
		Phone:          doctor.Phone,
		Title:          doctor.Title,
		Specialty:      doctor.Specialty,
		Introduction:   doctor.Introduction,
		AvatarURL:      doctor.AvatarURL,
		EmployeeNo:     doctor.EmployeeNo,
		Status:         doctor.Status,
		CreatedAt:      doctor.CreatedAt,
		DepartmentID:   dept.ID,
		DepartmentName: dept.Name,
		Roles:          make([]vo.RoleVO, 0),
	}

	if user != nil {
		doctorVO.Username = user.Username
		doctorVO.Email = user.Email
	}

	for _, role := range roles {
		doctorVO.Roles = append(doctorVO.Roles, vo.RoleVO{
			ID:   role.ID,
			Name: role.Name,
		})
	}

	return doctorVO
}
