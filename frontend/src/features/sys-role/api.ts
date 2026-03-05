import axios from '../../api/axios';
import type {
    ApiResponse,
    CreateRoleRequest,
    Role,
    RoleListParams,
    RoleListResponse,
    UpdateRoleRequest
} from './types';

export const roleApi = {
  // 分页查询角色列表
  list: (params: RoleListParams) => 
    axios.get<any, ApiResponse<RoleListResponse>>('/v1/roles', { params }),

  // 获取角色详情
  get: (id: number) => 
    axios.get<any, ApiResponse<Role>>(`/v1/roles/${id}`),

  // 创建角色
  create: (data: CreateRoleRequest) =>
    axios.post<any, ApiResponse<void>>('/v1/roles', data),

  // 更新角色
  update: (id: number, data: UpdateRoleRequest) => 
    axios.put<any, ApiResponse<void>>(`/v1/roles/${id}`, data),

  // 删除角色
  delete: (id: number) => 
    axios.delete<any, ApiResponse<void>>(`/v1/roles/${id}`),

  // 快捷更新状态
  updateStatus: (id: number, status: number) => 
    axios.put<any, ApiResponse<void>>(`/v1/roles/${id}/status`, { status }),

  // 复制角色
  copy: (id: number) => 
    axios.post<any, ApiResponse<void>>(`/v1/roles/${id}/copy`),

  // 分配菜单权限
  assignMenus: (id: number, menuIds: number[]) => 
    axios.post<any, ApiResponse<void>>(`/v1/roles/${id}/menus`, { menuIds }),

  // 获取角色关联的菜单ID列表
  getRoleMenus: (id: number) =>
    axios.get<any, ApiResponse<number[]>>(`/v1/roles/${id}/menus`),
};
