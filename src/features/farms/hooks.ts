import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/error';
import { queryKeys } from '@/lib/queryKeys';
import type { Farm, Paginated, Plot, SoilType } from '@/types/api';

export const useFarms = (page = 1, size = 12) =>
  useQuery({ queryKey: [...queryKeys.farms(page), size], placeholderData: (p) => p, queryFn: async () => (await api.get<Paginated<Farm>>('/farms', { params: { page, size } })).data });

export const useFarm = (id: string) =>
  useQuery({ queryKey: queryKeys.farm(id), queryFn: async () => (await api.get<Farm>(`/farms/${id}`)).data });

export const plotsQuery = (farmId: string) => ({ queryKey: queryKeys.plots(farmId), queryFn: async () => (await api.get<Plot[]>(`/farms/${farmId}/plots`)).data });
export const usePlots = (farmId: string) => useQuery(plotsQuery(farmId));

export interface NewFarm { name: string; district_id: string; upazila?: string | null }
export interface NewPlot { name: string; area_decimal: number; soil_type: SoilType; crop_id?: string | null; planting_date?: string | null; season?: string | null }

export function useFarmMutations() {
  const qc = useQueryClient();
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['farms'] }); void qc.invalidateQueries({ queryKey: queryKeys.dashboard }); };
  return {
    create: useMutation<Farm, AppError, NewFarm>({ mutationFn: async (b) => (await api.post<Farm>('/farms', b)).data, onSuccess: refresh }),
    remove: useMutation<unknown, AppError, string>({ mutationFn: async (id) => (await api.delete(`/farms/${id}`)).data, onSuccess: refresh }),
  };
}

export function usePlotMutations(farmId: string) {
  const qc = useQueryClient();
  const refresh = () => { void qc.invalidateQueries({ queryKey: queryKeys.plots(farmId) }); void qc.invalidateQueries({ queryKey: queryKeys.dashboard }); };
  return {
    create: useMutation<Plot, AppError, NewPlot>({ mutationFn: async (b) => (await api.post<Plot>(`/farms/${farmId}/plots`, b)).data, onSuccess: refresh }),
    remove: useMutation<unknown, AppError, string>({ mutationFn: async (id) => (await api.delete(`/plots/${id}`)).data, onSuccess: refresh }),
  };
}
