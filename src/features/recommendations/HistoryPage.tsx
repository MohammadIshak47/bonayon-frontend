import { useSearchParams } from 'react-router-dom';
import { QueryState } from '@/components/feedback/QueryState';
import { Skeleton } from '@/components/feedback/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { FormField, Select } from '@/components/ui/FormField';
import { Pagination } from '@/components/ui/Pagination';
import { CropResults } from '@/features/recommend/CropResults';
import { useRecommendations } from '@/features/recommend/hooks';
import type { RecommendationType } from '@/types/api';

export function HistoryPage() {
  const [params, setParams] = useSearchParams();
  const type = (params.get('type') as RecommendationType | null) ?? undefined;
  const page = Number(params.get('page') ?? '1') || 1;
  const q = useRecommendations({ type }, page);
  const set = (next: Record<string, string | undefined>) => setParams((p) => { const n = new URLSearchParams(p); Object.entries(next).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); return n; });
  return (
    <div className="space-y-6">
      <PageHeader title="Recommendation history" />
      <div className="max-w-xs"><FormField label="Type">{(p) => <Select value={type ?? ''} onChange={(e) => set({ type: e.target.value || undefined, page: undefined })} {...p}><option value="">All</option><option value="crop_choice">Crop suitability</option><option value="season_plan">Season plan</option></Select>}</FormField></div>
      <QueryState query={q} skeleton={<Skeleton className="h-32 w-full" />} isEmpty={(d) => d.items.length === 0} empty={{ title: 'No recommendations yet', description: 'Run the crop wizard or a season plan and it will appear here.' }}>
        {(d) => (
          <div className="space-y-4">
            <ul className="space-y-3">{d.items.map((r) => (
              <li key={r.id}><Card><details><summary className="flex min-h-tap cursor-pointer flex-wrap items-center justify-between gap-2 font-semibold"><span>{r.type === 'season_plan' ? 'Season plan' : 'Crop suitability'} · {r.season}</span><span className="font-normal text-muted">{new Date(r.created_at).toLocaleString()}</span></summary><div className="mt-3"><CropResults rec={r} /></div></details></Card></li>
            ))}</ul>
            <Pagination page={d.page} size={d.size} total={d.total} onPage={(p) => set({ page: String(p) })} />
          </div>
        )}
      </QueryState>
    </div>
  );
}
