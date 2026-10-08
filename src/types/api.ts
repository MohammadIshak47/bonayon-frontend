/**
 * Types for the Bonayon API, hand-written for readability and CHECKED against the backend's generated OpenAPI
 * types by src/types/contract.check.ts (run `npm run gen:api` with the backend up, then `npm run typecheck`).
 * The JSONB fields (Recommendation.payload / explanations) are untyped in OpenAPI, so CropChoicePayload and
 * SeasonPlanPayload below are verified only by the integration script, not by the compiler.
 */

// ---- [SCHEMA] ----
export type Role = 'farmer' | 'admin';
export interface User { id: string; name: string; email: string; phone: string | null; role: Role; is_active: boolean; created_at: string }
export interface District { id: string; name_en: string; name_bn: string; division: string; lat: number; lon: number }
export type SoilType = 'clay' | 'clay_loam' | 'sandy_loam' | 'sandy' | 'silt_loam' | 'peat';
export const SOIL_TYPES: SoilType[] = ['clay', 'clay_loam', 'sandy_loam', 'sandy', 'silt_loam', 'peat'];
export type WaterSensitivity = 'low' | 'medium' | 'high';
export interface Crop {
  id: string; name_en: string; name_bn: string; seasons: string[]; rain_min_mm: number; rain_max_mm: number;
  temp_min_c: number; temp_max_c: number; suitable_soils: string[]; water_sensitivity: WaterSensitivity;
  rotation_after: string[]; seed_kg_per_decimal: number; npk_note: string | null; is_active: boolean;
}
export interface Farm { id: string; user_id: string; name: string; district_id: string; upazila: string | null; created_at: string }
export interface Plot {
  id: string; farm_id: string; name: string; area_decimal: number; soil_type: SoilType;
  crop_id: string | null; planting_date: string | null; season: string | null; created_at: string;
}
export type RecommendationType = 'crop_choice' | 'season_plan';
export interface Recommendation {
  id: string; type: RecommendationType; plot_id: string | null; district_id: string; season: string;
  payload: unknown;            // [ASSUMED] shape differs per type, see CropChoicePayload / SeasonPlanPayload
  explanations: unknown;       // JSONB: rendered defensively via toStringList()
  advisory_text: string | null; disclaimer: string; created_at: string;
}

// ---- [ASSUMED] ----
export interface Paginated<T> { items: T[]; total: number; page: number; size: number }
export interface TokenResponse { access_token: string; token_type: string }
export interface ClimateMonth { month: number; temp_avg: number | null; rainfall_mm: number | null }
export interface ClimateProfile {
  district_id: string; years: number; months: ClimateMonth[]; annual_rainfall_mm?: number | null; mean_temp_c?: number | null;
  data_span?: { start: string; end: string } | null; fetched_at?: string | null; stale: boolean;
  source: string;               // e.g. "NASA POWER" or "MOCK (synthetic development data)"
  insufficient_data: boolean;   // true => months is empty because data is unavailable
}
export interface RiskMonth { month: number; heatwave_days: number; dry_spell_likelihood: number; monsoon_onset: boolean }
export interface RiskCalendar { district_id: string; months: RiskMonth[]; basis_years?: number | null; fetched_at?: string | null; stale: boolean; source: string; insufficient_data: boolean }
export interface AnomalyYear { year: number; temp_anomaly_c: number | null; rainfall_anomaly_pct: number | null }
export interface Anomalies { district_id: string; years: AnomalyYear[]; baseline_years?: number | null; fetched_at?: string | null; stale: boolean; source: string; insufficient_data: boolean }
export type Tier = 'excellent' | 'good' | 'marginal' | 'poor';
export interface CropScore {
  crop_id: string; name_en: string; name_bn?: string; score: number; tier: Tier;
  explanations: string[]; risk_notes?: string[];
}
export interface CropChoicePayload { results: CropScore[] }
export interface SeasonPlanPayload {
  crop?: CropScore; planting_window?: { start?: string; end?: string; note?: string }; risk_warnings?: string[];
}
export interface CropChoiceRequest { district_id: string; soil_type: SoilType; season: string }
export type SeasonPlanRequest = { plot_id: string } | CropChoiceRequest;
export interface RotationSuggestion { crop_id: string; name_en: string; name_bn?: string; explanation: string }
export interface RotationSuggestResponse { suggestions: RotationSuggestion[] }
export interface RotationPlan { id: string; plot_id: string; season_1_crop_id: string; season_2_crop_id: string; note: string | null; created_at: string }
export interface InputEstimate { seed_kg: number; npk_note: string | null; label: string }
export interface Dashboard {
  farms_count: number; plots_count: number; plans_count: number;
  latest_recommendation: Recommendation | null; recent_recommendations: Recommendation[];
}
export interface AuditLog { id: string; user_id: string | null; action: string; entity: string; entity_id: string | null; created_at: string }

export function toStringList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x)));
  if (v && typeof v === 'object') return Object.entries(v).map(([k, x]) => `${k}: ${typeof x === 'string' ? x : JSON.stringify(x)}`);
  return typeof v === 'string' ? [v] : [];
}
