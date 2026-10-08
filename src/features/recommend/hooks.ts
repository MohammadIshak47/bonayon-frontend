import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/error';
import { queryKeys } from '@/lib/queryKeys';
import type { Crop, CropChoiceRequest, Dashboard, InputEstimate, Paginated, Recommendation, RecommendationType, SeasonPlanRequest } from '@/types/api';

export const useCrops = () => useQuery({ queryKey: queryKeys.crops, staleTime: 3_600_000, queryFn: async () => (await api.get<Crop[]>('/crops')).data });

/** Season options come from the crop catalog itself, never hard-coded. */
export const seasonsOf = (crops: Crop[] | undefined) => [...new Set((crops ?? []).flatMap((c) => c.seasons))].sort();

export const useDashboard = () => useQuery({ queryKey: queryKeys.dashboard, queryFn: async () => (await api.get<Dashboard>('/dashboard')).data });

export interface RecFilters { type?: RecommendationType }
export const useRecommendations = (filters: RecFilters, page: number, size = 10) =>
  useQuery({
    queryKey: queryKeys.recommendations(filters, page), placeholderData: (prev) => prev,
    queryFn: async () => (await api.get<Paginated<Recommendation>>('/recommendations', { params: { ...filters, page, size } })).data,
  });

export function useCropChoice() {
  const qc = useQueryClient();
  return useMutation<Recommendation, AppError, CropChoiceRequest>({
    mutationFn: async (b) => (await api.post<Recommendation>('/recommendations/crop-choice', b)).data,
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['recommendations'] }); void qc.invalidateQueries({ queryKey: queryKeys.dashboard }); },
  });
}

export function useSeasonPlan() {
  const qc = useQueryClient();
  return useMutation<Recommendation, AppError, SeasonPlanRequest>({
    mutationFn: async (b) => (await api.post<Recommendation>('/recommendations/season-plan', b)).data,
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['recommendations'] }); void qc.invalidateQueries({ queryKey: queryKeys.dashboard }); },
  });
}

export const useInputEstimate = () =>
  useMutation<InputEstimate, AppError, { crop_id: string; area_decimal: number }>({
    mutationFn: async (b) => (await api.post<InputEstimate>('/calculator/input-estimate', b)).data,
  });
