export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  dataScope: number; // 1-全部, 2-本机构, 3-本科室, 4-本人
  status: number; // 0-禁用, 1-启用
  isSystem: number;
  createdAt: string;
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  dataScope?: number;
  status?: number;
}

export interface UpdateRoleRequest {
  name: string;
  code: string;
  description?: string;
  dataScope?: number;
  status?: number;
}

export interface RoleListParams {
  page: number;
  pageSize: number;
  name?: string;
  status?: number;
}

export interface RoleListResponse {
  total: number;
  list: Role[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
