import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api';
import type { UserListParams } from '../types';

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.list(params).then(res => res.data ?? { list: [], total: 0 }),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.get(id).then(res => res.data ?? null),
    enabled: !!id,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => 
      userApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => userApi.getRoles().then(res => res.data ?? []),
  });
}

export function useTitles() {
  return useQuery({
    queryKey: ['titles'],
    queryFn: () => userApi.getTitles().then(res => res.data ?? []),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => userApi.getDepartments().then(res => res.data ?? []),
  });
}
