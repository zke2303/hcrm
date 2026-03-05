export interface DepartmentTreeVO {
	id: number;
	name: string;
	type: number; // 1-医院, 2-科室
	parentId?: number;
	children?: DepartmentTreeVO[];
}

export interface UserVO {
	id: number;
	username: string;
	realName: string;
	phone: string;
	email: string;
	employeeNo: string;
	departmentId?: number;
	departmentName: string;
	status: number;
	isDoctor: boolean;
	doctorId?: number;
	title?: string;
	specialty?: string;
	introduction?: string;
}

export interface DepartmentStaffVO {
	departmentId: number;
	departmentName: string;
	staff: UserVO[];
}

export interface UpdateDeptHierarchyRequest {
	parentId: number | null;
}

export interface AssignStaffToDeptRequest {
	doctorId: number;
	deptIds: number[];
}
