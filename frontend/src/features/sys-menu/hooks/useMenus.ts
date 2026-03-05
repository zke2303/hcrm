import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '../api';
import type { CreateMenuRequest, UpdateMenuRequest } from '../types';

export function useMenuTree() {
  return useQuery({
    queryKey: ['menuTree'],
    queryFn: () => menuApi.tree().then(res => res.data ?? []),
  });
}

export function useMenu(id: number) {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: () => menuApi.get(id).then(res => res.data ?? null),
    enabled: !!id,
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMenuRequest) => menuApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuTree'] });
    },
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMenuRequest }) => menuApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuTree'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => menuApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuTree'] });
    },
  });
}
