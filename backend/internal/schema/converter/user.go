package converter

import (
	"hcrm/backend/internal/model"
	"hcrm/backend/internal/schema/vo"
)

// UserToVO 将用户模型转换为 VO
func UserToVO(user *model.User, dept *model.Department, roles []model.Role, doctor *model.Doctor) *vo.UserVO {
	if user == nil {
		return nil
	}

	userVO := &vo.UserVO{
		ID:           user.ID,
		Username:     user.Username,
		RealName:     user.RealName,
		Phone:        user.Phone,
		Email:        user.Email,
		EmployeeNo:   user.EmployeeNo,
		DepartmentID: user.DepartmentID,
		Remark:       user.Remark,
		Status:       user.Status,
		LastLoginAt:  user.LastLoginAt,
		CreatedAt:    user.CreatedAt,
		Roles:        make([]vo.RoleVO, 0),
	}

	if dept != nil {
		userVO.DepartmentName = dept.Name
	}

	for _, role := range roles {
		userVO.Roles = append(userVO.Roles, vo.RoleVO{
			ID:   role.ID,
			Name: role.Name,
		})
	}

	if doctor != nil {
		userVO.IsDoctor = true
		userVO.Title = doctor.Title
		userVO.Specialty = doctor.Specialty
		userVO.Introduction = doctor.Introduction
	}

	return userVO
}

// UserListToVO 将用户列表转换为 VO 列表
func UserListToVO(users []*model.User, depts map[uint]*model.Department) []*vo.UserVO {
	res := make([]*vo.UserVO, 0, len(users))
	for _, user := range users {
		var dept *model.Department
		if user.DepartmentID != nil {
			dept = depts[*user.DepartmentID]
		}
		res = append(res, UserToVO(user, dept, nil, nil))
	}
	return res
}
