import { describe, expect, it } from 'vitest';
import type { Recommendation } from '@/types/api';
import { advisoryFromRecommendation } from './advisory';

const base: Recommendation = { id: '1', type: 'crop_choice', plot_id: null, district_id: 'd', season: 'Rabi', payload: null, explanations: [], advisory_text: null, disclaimer: 'D', created_at: '2026-01-01T00:00:00Z' };

describe('advisoryFromRecommendation', () => {
  it('uses only returned fields and keeps the backend disclaimer', () => {
    const a = advisoryFromRecommendation({ ...base, payload: { results: [{ crop_id: 'c', name_en: 'Wheat', score: 71.6, tier: 'good', explanations: [] }] } });
    expect(a.what).toContain('Wheat');
    expect(a.what).toContain('72');
    expect(a.disclaimer).toBe('D');
  });
  it('does not invent a crop when results are empty', () => {
    expect(advisoryFromRecommendation({ ...base, payload: { results: [] } }).what).toBe('No crop could be scored');
  });
  it('joins season-plan risk warnings', () => {
    const a = advisoryFromRecommendation({ ...base, type: 'season_plan', payload: { risk_warnings: ['Heat', 'Dry'] } });
    expect(a.warning).toBe('Heat Dry');
  });
});
