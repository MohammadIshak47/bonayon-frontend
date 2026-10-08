import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Anomalies, ClimateProfile, District, RiskCalendar } from '@/types/api';

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const useDistricts = () =>
  useQuery({ queryKey: queryKeys.districts, staleTime: 3_600_000, queryFn: async () => (await api.get<District[]>('/districts')).data });

export const useClimate = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.climate(id ?? ''), enabled: !!id, staleTime: 600_000,
    queryFn: async () => (await api.get<ClimateProfile>(`/climate/${id}/profile`, { params: { years: 20 } })).data,
  });

export const useRiskCalendar = (id: string | undefined, season?: string) =>
  useQuery({
    queryKey: queryKeys.risk(id ?? '', season), enabled: !!id, staleTime: 600_000,
    queryFn: async () => (await api.get<RiskCalendar>(`/climate/${id}/risk-calendar`, { params: season ? { season } : {} })).data,
  });

export const useAnomalies = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.anomalies(id ?? ''), enabled: !!id, staleTime: 600_000,
    queryFn: async () => (await api.get<Anomalies>(`/climate/${id}/anomalies`, { params: { years: 5 } })).data,
  });
