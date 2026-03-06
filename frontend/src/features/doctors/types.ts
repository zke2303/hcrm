import type { ApiResponse, Role } from '../sys-user/types';

export interface Doctor {
  id: number;
  userId: number;
  username: string;
  realName: string;
  phone: string;
  email?: string;
  employeeNo: string;
  departmentId: number;
  departmentName: string;
  title: string;
  specialty?: string;
  introduction?: string;
  avatarUrl?: string;
  status: number; // 0-离职, 1-在职
  createdAt: string;
  roles: Role[];
}

export interface CreateDoctorRequest {
  realName: string;
  phone: string;
  departmentId: number;
  title: string;
  roleIds: number[];
  employeeNo?: string;
  introduction?: string;
  specialty?: string;
  avatarUrl?: string;
}

export interface UpdateDoctorRequest extends CreateDoctorRequest {
  status?: number;
}

export interface DoctorListParams {
  page: number;
  pageSize: number;
  keyword?: string;
  departmentId?: number;
  status?: number;
}

export interface DoctorListResponse {
  total: number;
  list: Doctor[];
}

export type { ApiResponse };
