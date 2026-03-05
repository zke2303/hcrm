import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orgApi } from '../api';
import type { UpdateDeptHierarchyRequest } from '../types';

export function useDeptTree() {
  return useQuery({
    queryKey: ['org', 'tree'],
    queryFn: () => orgApi.getDeptTree().then(res => res.data),
  });
}

export function useStaffList(deptId?: number) {
  return useQuery({
    queryKey: ['org', 'staff', deptId],
    queryFn: () => orgApi.getStaffList(deptId).then(res => res.data),
  });
}

export function useUpdateDeptHierarchy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDeptHierarchyRequest }) => 
      orgApi.updateDeptHierarchy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org', 'tree'] });
    },
  });
}

export function useAssignStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, deptIds }: { doctorId: number; deptIds: number[] }) => 
      orgApi.assignStaff(doctorId, deptIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org', 'staff'] });
    },
  });
}
