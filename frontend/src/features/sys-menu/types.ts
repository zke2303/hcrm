export interface Menu {
  id: number;
  parentId: number;
  name: string;
  type: number; // 0-目录, 1-菜单, 2-按钮
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  sortOrder: number;
  status: number;
  visible: number;
  apiPath?: string;
  children?: Menu[];
  createdAt: string;
}

export interface CreateMenuRequest {
  parentId: number;
  name: string;
  type: number;
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  sortOrder: number;
  status?: number;
  visible?: number;
  apiPath?: string;
}

export interface UpdateMenuRequest {
  parentId: number;
  name: string;
  type: number;
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  sortOrder: number;
  status?: number;
  visible?: number;
  apiPath?: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
