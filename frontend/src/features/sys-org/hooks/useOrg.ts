import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orgApi } from '../api';
import type { UpdateDeptHierarchyRequest, CreateDeptRequest } from '../types';

export function useDeptTree() {
  return useQuery({
    queryKey: ['deptTree'],
    queryFn: () => orgApi.getDeptTree().then(res => res.data ?? []),
  });
}

export function useStaffList(deptId?: number) {
  return useQuery({
    queryKey: ['staffList', deptId],
    queryFn: () => orgApi.getStaffList(deptId).then(res => res.data ?? []),
    enabled: deptId !== undefined,
  });
}

export function useUpdateDeptHierarchy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDeptHierarchyRequest }) => 
      orgApi.updateDeptHierarchy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deptTree'] });
    },
  });
}

export function useCreateDept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeptRequest) => orgApi.createDept(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deptTree'] });
    },
  });
}

export function useDeleteDept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => orgApi.deleteDept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deptTree'] });
    },
  });
}

export function useAssignStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, deptIds }: { doctorId: number; deptIds: number[] }) => 
      orgApi.assignStaff(doctorId, deptIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffList'] });
    },
  });
}
