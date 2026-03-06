import axios from '../../api/axios';
import type {
    ApiResponse,
    CreateDoctorRequest,
    Doctor,
    DoctorListParams,
    DoctorListResponse,
    UpdateDoctorRequest
} from './types';

export const doctorApi = {
  // 分页查询医生列表
  list: (params: DoctorListParams) => 
    axios.get<any, ApiResponse<DoctorListResponse>>('/v1/doctors', { params }),

  // 获取医生详情
  get: (id: number) => 
    axios.get<any, ApiResponse<Doctor>>(`/v1/doctors/${id}`),

  // 创建医生
  create: (data: CreateDoctorRequest) =>
    axios.post<any, ApiResponse<Doctor>>('/v1/doctors', data),

  // 更新医生
  update: (id: number, data: UpdateDoctorRequest) => 
    axios.put<any, ApiResponse<void>>(`/v1/doctors/${id}`, data),

  // 删除医生
  delete: (id: number) => 
    axios.delete<any, ApiResponse<void>>(`/v1/doctors/${id}`),
};
