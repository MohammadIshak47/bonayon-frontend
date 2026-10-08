import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { QueryState } from '@/components/feedback/QueryState';
import { Skeleton } from '@/components/feedback/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { plotsQuery, useFarms } from '@/features/farms/hooks';
import { useCrops } from '@/features/recommend/hooks';
import { useQueries } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/error';
import { queryKeys } from '@/lib/queryKeys';
import type { RotationPlan, RotationSuggestResponse } from '@/types/api';

export function RotationPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const crops = useCrops();
  const farms = useFarms(1, 50);
  const plots = useQueries({ queries: (farms.data?.items ?? []).map((f) => plotsQuery(f.id)) }).flatMap((q) => q.data ?? []);
  const plans = useQuery({ queryKey: queryKeys.rotationPlans, queryFn: async () => (await api.get<RotationPlan[]>('/rotation/plans')).data });
  const suggest = useMutation<RotationSuggestResponse, AppError, string>({ mutationFn: async (id) => (await api.post<RotationSuggestResponse>('/rotation/suggest', { season_1_crop_id: id })).data });
  const save = useMutation<RotationPlan, AppError, { plot_id: string; season_1_crop_id: string; season_2_crop_id: string; note?: string }>({
    mutationFn: async (b) => (await api.post<RotationPlan>('/rotation/plans', b)).data,
    onSuccess: () => { toast.success('Rotation plan saved'); void qc.invalidateQueries({ queryKey: queryKeys.rotationPlans }); },
    onError: (e) => toast.error(e.message),
  });
  const [c1, setC1] = useState('');
  const [plotId, setPlotId] = useState('');
  const [note, setNote] = useState('');
  const name = (id: string) => crops.data?.find((c) => c.id === id)?.name_en ?? id;
  return (
    <div className="space-y-6">
      <PageHeader title="Crop rotation" description="Pick this season's crop to see options for the next season." />
      <Card className="space-y-4">
        <FormField label="This season's crop">{(p) => <Select value={c1} onChange={(e) => { setC1(e.target.value); suggest.reset(); }} {...p}><option value="">Select a crop…</option>{crops.data?.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}</Select>}</FormField>
        <Button disabled={!c1} loading={suggest.isPending} onClick={() => suggest.mutate(c1)}>Show next-season options</Button>
        {suggest.isError && <p role="alert" className="text-danger-text">{suggest.error.message}</p>}
      </Card>
      {suggest.data && (suggest.data.suggestions.length === 0 ? <Card><p className="text-muted">No rotation options are listed for this crop.</p></Card> : (
        <section aria-labelledby="opt-h" className="space-y-3"><h2 id="opt-h" className="text-xl font-semibold">Next-season options</h2>
          <FormField label="Save to plot">{(p) => <Select value={plotId} onChange={(e) => setPlotId(e.target.value)} {...p}><option value="">Select a plot…</option>{plots.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}</Select>}</FormField>
          <FormField label="Note (optional)">{(p) => <Input value={note} onChange={(e) => setNote(e.target.value)} {...p} />}</FormField>
          <ul className="stack-grid grid gap-3 md:grid-cols-2">{suggest.data.suggestions.map((s) => (
            <li key={s.crop_id}><Card className="space-y-2"><h3 className="font-semibold">{s.name_en}</h3><p className="text-muted">{s.explanation}</p>
              <Button variant="outline" disabled={!plotId} loading={save.isPending} onClick={() => save.mutate({ plot_id: plotId, season_1_crop_id: c1, season_2_crop_id: s.crop_id, note: note || undefined })}>Save this plan</Button></Card></li>
          ))}</ul>
        </section>
      ))}
      <section aria-labelledby="saved-h" className="space-y-3"><h2 id="saved-h" className="text-xl font-semibold">Saved plans</h2>
        <QueryState query={plans} skeleton={<Skeleton className="h-20 w-full" />} isEmpty={(p) => p.length === 0} empty={{ title: 'No saved plans', description: 'Save a rotation option above to see it here.' }}>
          {(list) => <ul className="space-y-2">{list.map((p) => <li key={p.id}><Card><p className="font-semibold">{name(p.season_1_crop_id)} → {name(p.season_2_crop_id)}</p>{p.note && <p className="text-muted">{p.note}</p>}<p className="text-sm text-muted">{new Date(p.created_at).toLocaleDateString()}</p></Card></li>)}</ul>}
        </QueryState>
      </section>
    </div>
  );
}
