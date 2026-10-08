import { useSearchParams } from 'react-router-dom';
import { DistrictClimate } from '@/features/climate/DistrictClimate';
import { DistrictSelect } from '@/features/climate/DistrictSelect';

/** Compact, chrome-free climate card for iframes: /widget?district=<id>. Embedding also needs backend/hosting headers (not verified). */
export function WidgetPage() {
  const [params, setParams] = useSearchParams();
  const id = params.get('district') ?? '';
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-3">
      <DistrictSelect value={id} onChange={(v) => setParams(v ? { district: v } : {})} />
      {id && <DistrictClimate districtId={id} />}
      <p className="text-sm text-muted">Powered by <a className="text-primary-text underline" href="/" target="_top">Bonayon</a></p>
    </div>
  );
}
