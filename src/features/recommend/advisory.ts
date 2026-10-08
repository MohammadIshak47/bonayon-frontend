import type { CropChoicePayload, Recommendation, SeasonPlanPayload } from '@/types/api';

export interface AdvisoryView { title: string; what: string; when?: string; why?: string; warning?: string; generatedAt: string; disclaimer: string }

/** Maps a stored recommendation to AdvisoryCard props using only fields the API returned. */
export function advisoryFromRecommendation(rec: Recommendation): AdvisoryView {
  const base = { generatedAt: rec.created_at, disclaimer: rec.disclaimer, why: rec.advisory_text ?? undefined };
  if (rec.type === 'season_plan') {
    const p = (rec.payload ?? {}) as SeasonPlanPayload;
    const w = p.planting_window;
    const when = w ? [w.start && w.end ? `${w.start} to ${w.end}` : (w.start ?? w.end), w.note].filter(Boolean).join(' · ') : undefined;
    return { ...base, title: 'Season plan', what: p.crop ? `Recommended crop: ${p.crop.name_en}` : 'See the plan details below', when: when || undefined, warning: p.risk_warnings?.join(' ') || undefined };
  }
  const top = ((rec.payload ?? {}) as Partial<CropChoicePayload>).results?.[0];
  return { ...base, title: 'Crop suitability', what: top ? `Best match: ${top.name_en} (score ${Math.round(top.score)} of 100)` : 'No crop could be scored', warning: top?.risk_notes?.join(' ') || undefined };
}
