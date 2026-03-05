import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleApi } from '../api';
import type { CreateRoleRequest, RoleListParams, UpdateRoleRequest } from '../types';

export function useRoles(params: RoleListParams) {
  return useQuery({
    queryKey: ['roles', params],
    queryFn: () => roleApi.list(params).then(res => res.data),
  });
}

export function useRole(id: number) {
  return useQuery({
    queryKey: ['role', id],
    queryFn: () => roleApi.get(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleRequest) => roleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleRequest }) => roleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useUpdateRoleStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => roleApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useCopyRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleApi.copy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useAssignRoleMenus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, menuIds }: { id: number; menuIds: number[] }) => roleApi.assignMenus(id, menuIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role'] });
    },
  });
}

export function useRoleMenus(id: number) {
  return useQuery({
    queryKey: ['role-menus', id],
    queryFn: () => roleApi.getRoleMenus(id).then(res => res.data),
    enabled: !!id,
  });
}
