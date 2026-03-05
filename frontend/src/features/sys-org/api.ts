import apiClient from "@/api/axios";
import type { DepartmentTreeVO, DepartmentStaffVO, UpdateDeptHierarchyRequest } from "./types";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const orgApi = {
  getDeptTree: () => apiClient.get<any, ApiResponse<DepartmentTreeVO[]>>("/departments/tree"),
  getStaffList: (deptId?: number) => apiClient.get<any, ApiResponse<DepartmentStaffVO[]>>(`/departments/${deptId || 0}/staff`),
  updateDeptHierarchy: (id: number, data: UpdateDeptHierarchyRequest) => 
    apiClient.put(`/departments/${id}/hierarchy`, data),
  assignStaff: (doctorId: number, deptIds: number[]) => 
    apiClient.post(`/departments/staff-move`, { doctorId, deptIds }),
};
