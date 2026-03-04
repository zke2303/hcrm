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

export interface Title {
  id: number;
  name: string;
  sortOrder?: number;
}

export interface CreateUserRequest {
  username: string;
  realName: string;
  phone: string;
  email?: string;
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
  keyword?: string;
  username?: string;
  realName?: string;
  phone?: string;
  departmentId?: number;
  status?: number;
  title?: string;
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

// 创建用户响应
export interface CreateUserResponse {
  id: number;
  username: string;
  employeeNo: string;
  defaultPassword: string;
}
