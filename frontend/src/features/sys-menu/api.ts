import axios from '../../api/axios';
import type {
    ApiResponse,
    CreateMenuRequest,
    Menu,
    UpdateMenuRequest
} from './types';

export const menuApi = {
  // 获取完整菜单树
  tree: () => 
    axios.get<any, ApiResponse<Menu[]>>('/v1/menus/list/tree'),

  // 获取菜单详情
  get: (id: number) => 
    axios.get<any, ApiResponse<Menu>>(`/v1/menus/${id}`),

  // 创建菜单
  create: (data: CreateMenuRequest) =>
    axios.post<any, ApiResponse<void>>('/v1/menus', data),

  // 更新菜单
  update: (id: number, data: UpdateMenuRequest) => 
    axios.put<any, ApiResponse<void>>(`/v1/menus/${id}`, data),

  // 删除菜单
  delete: (id: number) => 
    axios.delete<any, ApiResponse<void>>(`/v1/menus/${id}`),
};
