import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '../api';
import type { CreateDoctorRequest, DoctorListParams, UpdateDoctorRequest } from '../types';

export const useDoctors = (params: DoctorListParams) => {
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: () => doctorApi.list(params),
  });
};

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDoctorRequest) => doctorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDoctorRequest }) => 
      doctorApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => doctorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};
