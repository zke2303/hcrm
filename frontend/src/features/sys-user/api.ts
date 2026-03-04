import axios from '../../api/axios';
import type {
    ApiResponse,
    CreateUserRequest,
    Role,
    Title,
    UpdateUserRequest,
    User,
    UserListParams,
    UserListResponse
} from './types';

export const userApi = {
  // 分页查询用户列表
  list: (params: UserListParams) => 
    axios.get<any, ApiResponse<UserListResponse>>('/v1/users', { params }),

  // 获取用户详情
  get: (id: number) => 
    axios.get<any, ApiResponse<User>>(`/v1/users/${id}`),

  // 创建用户
  create: (data: CreateUserRequest) =>
    axios.post<any, ApiResponse<any>>('/v1/users', data),
  // 更新用户
  update: (id: number, data: UpdateUserRequest) => 
    axios.put<any, ApiResponse<void>>(`/v1/users/${id}`, data),

  // 删除用户
  delete: (id: number) => 
    axios.delete<any, ApiResponse<void>>(`/v1/users/${id}`),

  // 快捷更新状态
  updateStatus: (id: number, status: number) => 
    axios.put<any, ApiResponse<void>>(`/v1/users/${id}/status`, { status }),

  // 重置密码
  resetPassword: (id: number, password: string) => 
    axios.put<any, ApiResponse<void>>(`/v1/users/${id}/password`, { password }),

  // 获取所有可用角色
  getRoles: () => 
    axios.get<any, ApiResponse<Role[]>>('/v1/users/roles'),

  // 获取所有职称字典
  getTitles: () =>
    axios.get<any, ApiResponse<Title[]>>('/v1/users/titles'),
};
