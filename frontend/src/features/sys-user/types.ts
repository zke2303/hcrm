export interface User {
  id: number;
  username: string;
  realName: string;
  phone: string;
  email: string;
  employeeNo: string;
  departmentId?: number;
  departmentName?: string;
  remark: string;
  status: number; // 0-禁用, 1-启用
  lastLoginAt?: string;
  createdAt: string;
  roles: Role[];
  
  // 联动医生档案可选信息
  isDoctor?: boolean;
  title?: string;
  specialty?: string;
  introduction?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface CreateUserRequest {
  username: string;
  password?: string;
  realName: string;
  phone: string;
  email?: string;
  employeeNo?: string;
  departmentId?: number;
  remark?: string;
  roleIds?: number[];
  isDoctor?: boolean;
  title?: string;
  specialty?: string;
  introduction?: string;
}

export interface UpdateUserRequest {
  realName: string;
  phone: string;
  email?: string;
  employeeNo?: string;
  departmentId?: number;
  remark?: string;
  status?: number;
  roleIds?: number[];
  isDoctor?: boolean;
  title?: string;
  specialty?: string;
  introduction?: string;
}

export interface UserListParams {
  page: number;
  pageSize: number;
  username?: string;
  realName?: string;
  phone?: string;
  departmentId?: number;
  status?: number;
}

export interface UserListResponse {
  total: number;
  list: User[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
