import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/app/providers/AuthProvider';
import { PendingChanges } from '@/components/feedback/PendingChanges';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { queue } from '@/lib/offlineQueue';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { QueryState } from '@/components/feedback/QueryState';
import { Skeleton } from '@/components/feedback/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { DistrictSelect } from '@/features/climate/DistrictSelect';
import { useDistricts } from '@/features/climate/hooks';
import { soilLabel } from '@/features/recommend/CropWizardPage';
import { seasonsOf, useCrops } from '@/features/recommend/hooks';
import { SOIL_TYPES, type Plot } from '@/types/api';
import { useFarm, useFarmMutations, useFarms, usePlotMutations, usePlots } from './hooks';

const farmSchema = z.object({ name: z.string().min(2, 'Enter a farm name'), district_id: z.string().min(1, 'Choose a district'), upazila: z.string().optional() });
type FarmValues = z.infer<typeof farmSchema>;

export function FarmsPage() {
  const toast = useToast();
  const { language } = useLanguage();
  const [page, setPage] = useState(1);
  const farms = useFarms(page);
  const districts = useDistricts();
  const { create } = useFarmMutations();
  const f = useForm<FarmValues>({ resolver: zodResolver(farmSchema), defaultValues: { district_id: '' } });
  const district = useWatch({ control: f.control, name: 'district_id' });
  const e = f.formState.errors;
  const { user } = useAuth();
  const submit = (v: FarmValues) => {
    const payload = { name: v.name, district_id: v.district_id, upazila: v.upazila || null };
    if (!navigator.onLine && user) { queue.enqueue({ kind: 'create_farm', payload }, user.id); toast.success('Saved on this device. It will be sent when you are online.'); f.reset(); return; }
    create.mutate(payload, { onSuccess: () => { toast.success('Farm added'); f.reset(); }, onError: (err) => toast.error(err.message) });
  };
  const dn = (id: string) => { const d = districts.data?.find((x) => x.id === id); return d ? (language === 'bn' ? d.name_bn : d.name_en) : ''; };
  return (
    <div className="space-y-6">
      <PageHeader title="Farms" />
      <PendingChanges />
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Add a farm</h2>
        <form className="stack-grid grid gap-4 md:grid-cols-3" noValidate
          onSubmit={f.handleSubmit(submit)}>
          <FormField label="Farm name" error={e.name?.message}>{(p) => <Input {...p} {...f.register('name')} />}</FormField>
          <div><DistrictSelect value={district} onChange={(v) => f.setValue('district_id', v, { shouldValidate: true })} />{e.district_id && <p role="alert" className="text-sm text-danger-text">{e.district_id.message}</p>}</div>
          <FormField label="Upazila (optional)">{(p) => <Input {...p} {...f.register('upazila')} />}</FormField>
          <div className="md:col-span-3"><Button type="submit" loading={create.isPending}>Add farm</Button></div>
        </form>
      </Card>
      <QueryState query={farms} skeleton={<Skeleton className="h-28 w-full" />} isEmpty={(d) => d.items.length === 0} empty={{ title: 'No farms yet', description: 'Add your first farm above to start planning.' }}>
        {(d) => (
          <div className="space-y-4">
            <ul className="stack-grid grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {d.items.map((fm) => (
                <li key={fm.id}><Link to={`/farms/${fm.id}`} className="block rounded-card focus-visible:outline"><Card className="h-full hover:bg-raised"><h3 className="font-semibold">{fm.name}</h3><p className="text-muted">{dn(fm.district_id)}{fm.upazila ? ` · ${fm.upazila}` : ''}</p></Card></Link></li>
              ))}
            </ul>
            {d.total > d.size && <Pagination page={d.page} size={d.size} total={d.total} onPage={setPage} />}
          </div>
        )}
      </QueryState>
    </div>
  );
}

function PlotRow({ plot, cropName, onDelete }: { plot: Plot; cropName: string; onDelete: () => void }) {
  return (
    <Card className="space-y-1">
      <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{plot.name}</h3><Button variant="ghost" onClick={onDelete} aria-label={`Delete plot ${plot.name}`}>Delete</Button></div>
      <p className="text-muted">{plot.area_decimal} decimal · {soilLabel(plot.soil_type)} · {cropName}{plot.season ? ` · ${plot.season}` : ''}{plot.planting_date ? ` · planted ${plot.planting_date}` : ''}</p>
    </Card>
  );
}

export function FarmDetailPage() {
  const { farmId = '' } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const farm = useFarm(farmId);
  const plots = usePlots(farmId);
  const crops = useCrops();
  const { remove } = usePlotMutations(farmId);
  const farmM = useFarmMutations();
  const [del, setDel] = useState<Plot | null>(null);
  const [delFarm, setDelFarm] = useState(false);
  const cropName = (id: string | null) => (id ? (crops.data?.find((c) => c.id === id)?.name_en ?? 'Unknown crop') : 'No crop set');
  return (
    <div className="space-y-6">
      <QueryState query={farm} skeleton={<Skeleton className="h-16 w-full" />}>
        {(fm) => <PageHeader title={fm.name} description={fm.upazila ?? undefined} action={<Button variant="danger" onClick={() => setDelFarm(true)}>Delete farm</Button>} />}
      </QueryState>
      <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Plots</h2><ButtonLink to={`/farms/${farmId}/plots/new`}>Add plot</ButtonLink></div>
      <QueryState query={plots} skeleton={<Skeleton className="h-28 w-full" />} isEmpty={(p) => p.length === 0} empty={{ title: 'No plots yet', description: 'Add a plot to get crop and season advice.', action: <ButtonLink to={`/farms/${farmId}/plots/new`}>Add plot</ButtonLink> }}>
        {(list) => (
          <>
            <ul className="stack-grid grid gap-3 lg:hidden">{list.map((p) => <li key={p.id}><PlotRow plot={p} cropName={cropName(p.crop_id)} onDelete={() => setDel(p)} /></li>)}</ul>
            <Card className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left"><thead><tr className="border-b border-subtle"><th className="py-2">Plot</th><th>Area (decimal)</th><th>Soil</th><th>Crop</th><th>Season</th><th>Planted</th><th /></tr></thead>
                <tbody>{list.map((p) => <tr key={p.id} className="border-b border-subtle"><td className="py-2 font-semibold">{p.name}</td><td>{p.area_decimal}</td><td>{soilLabel(p.soil_type)}</td><td>{cropName(p.crop_id)}</td><td>{p.season ?? '—'}</td><td>{p.planting_date ?? '—'}</td><td><Button variant="ghost" onClick={() => setDel(p)} aria-label={`Delete plot ${p.name}`}>Delete</Button></td></tr>)}</tbody></table>
            </Card>
          </>
        )}
      </QueryState>
      <ConfirmDialog open={delFarm} title="Delete farm?" message="This deletes the farm and all its plots. It cannot be undone." loading={farmM.remove.isPending} onCancel={() => setDelFarm(false)}
        onConfirm={() => farmM.remove.mutate(farmId, { onSuccess: () => { toast.success('Farm deleted'); nav('/farms'); }, onError: (e) => toast.error(e.message) })} />
      <Modal open={del !== null} onClose={() => setDel(null)} title="Delete plot?">
        <p className="mb-4 text-muted">This removes “{del?.name}”. It cannot be undone.</p>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDel(null)}>Cancel</Button>
          <Button variant="danger" loading={remove.isPending} onClick={() => del && remove.mutate(del.id, { onSuccess: () => { toast.success('Plot deleted'); setDel(null); }, onError: (e) => toast.error(e.message) })}>Delete</Button></div>
      </Modal>
    </div>
  );
}

const plotSchema = z.object({
  name: z.string().min(1, 'Enter a plot name'), area_decimal: z.coerce.number({ message: 'Enter the area' }).positive('Area must be above 0'),
  soil_type: z.enum(SOIL_TYPES, { message: 'Choose a soil type' }), crop_id: z.string().optional(), planting_date: z.string().optional(), season: z.string().optional(),
});

export function PlotFormPage() {
  const { farmId = '' } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const crops = useCrops();
  const { create } = usePlotMutations(farmId);
  const f = useForm<z.input<typeof plotSchema>, unknown, z.output<typeof plotSchema>>({ resolver: zodResolver(plotSchema) });
  const e = f.formState.errors;
  const { user } = useAuth();
  const submit = (v: z.output<typeof plotSchema>) => {
    const payload = { name: v.name, area_decimal: v.area_decimal, soil_type: v.soil_type, crop_id: v.crop_id || null, planting_date: v.planting_date || null, season: v.season || null };
    if (!navigator.onLine && user) { queue.enqueue({ kind: 'create_plot', farmId, payload }, user.id); toast.success('Saved on this device. It will be sent when you are online.'); nav(`/farms/${farmId}`); return; }
    create.mutate(payload, { onSuccess: () => { toast.success('Plot added'); nav(`/farms/${farmId}`); }, onError: (err) => toast.error(err.message) });
  };
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="New plot" />
      <Card>
        <form className="stack-grid grid gap-4 md:grid-cols-2" noValidate
          onSubmit={f.handleSubmit(submit)}>
          <FormField label="Plot name" error={e.name?.message}>{(p) => <Input {...p} {...f.register('name')} />}</FormField>
          <FormField label="Area (decimal)" error={e.area_decimal?.message}>{(p) => <Input type="number" inputMode="decimal" step="any" {...p} {...f.register('area_decimal')} />}</FormField>
          <FormField label="Soil type" error={e.soil_type?.message}>{(p) => <Select defaultValue="" {...p} {...f.register('soil_type')}><option value="" disabled>Select…</option>{SOIL_TYPES.map((s) => <option key={s} value={s}>{soilLabel(s)}</option>)}</Select>}</FormField>
          <FormField label="Crop (optional)">{(p) => <Select defaultValue="" {...p} {...f.register('crop_id')}><option value="">None yet</option>{crops.data?.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}</Select>}</FormField>
          <FormField label="Season (optional)">{(p) => <Select defaultValue="" {...p} {...f.register('season')}><option value="">Not set</option>{seasonsOf(crops.data).map((s) => <option key={s}>{s}</option>)}</Select>}</FormField>
          <FormField label="Planting date (optional)">{(p) => <Input type="date" {...p} {...f.register('planting_date')} />}</FormField>
          <div className="flex gap-2 md:col-span-2"><Button type="submit" loading={create.isPending}>Save plot</Button><ButtonLink to={`/farms/${farmId}`} variant="outline">Cancel</ButtonLink></div>
        </form>
      </Card>
    </div>
  );
}
