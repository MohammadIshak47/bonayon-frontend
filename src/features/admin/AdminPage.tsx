import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { QueryState } from '@/components/feedback/QueryState';
import { Skeleton } from '@/components/feedback/States';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Input, Select } from '@/components/ui/FormField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/error';
import { queryKeys } from '@/lib/queryKeys';
import { SOIL_TYPES, type AuditLog, type Crop, type Paginated, type User } from '@/types/api';

type Tab = 'users' | 'crops' | 'audit';

function UsersTab() {
  const { user: me } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const filters = { query, page };
  const q = useQuery({ queryKey: queryKeys.admin('users', filters), placeholderData: (p) => p, queryFn: async () => (await api.get<Paginated<User>>('/admin/users', { params: { query: query || undefined, page } })).data });
  const toggle = useMutation<User, AppError, User>({
    mutationFn: async (u) => (await api.patch<User>(`/admin/users/${u.id}`, { is_active: !u.is_active })).data,
    onSuccess: () => { toast.success('User updated'); void qc.invalidateQueries({ queryKey: ['admin', 'users'] }); }, onError: (e) => toast.error(e.message),
  });
  return (
    <div className="space-y-4">
      <div className="max-w-sm"><FormField label="Search users">{(p) => <Input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} {...p} />}</FormField></div>
      <QueryState query={q} skeleton={<Skeleton className="h-32 w-full" />} isEmpty={(d) => d.items.length === 0} empty={{ title: 'No users found' }}>
        {(d) => (
          <>
            <ul className="stack-grid grid gap-3 md:grid-cols-2">{d.items.map((u) => (
              <li key={u.id}><Card className="flex flex-wrap items-center justify-between gap-2">
                <div><p className="font-semibold">{u.name}</p><p className="text-muted">{u.email}</p><div className="mt-1 flex gap-1"><Badge>{u.role}</Badge><Badge>{u.is_active ? 'Active' : 'Inactive'}</Badge></div></div>
                <Button variant={u.is_active ? 'danger' : 'outline'} disabled={u.role === 'admin' || u.id === me?.id} loading={toggle.isPending && toggle.variables?.id === u.id} onClick={() => toggle.mutate(u)}>{u.is_active ? 'Deactivate' : 'Activate'}</Button>
              </Card></li>))}</ul>
            <Pagination page={d.page} size={d.size} total={d.total} onPage={setPage} />
          </>
        )}
      </QueryState>
    </div>
  );
}

const cropSchema = z.object({
  name_en: z.string().min(2, 'Required'), name_bn: z.string().min(1, 'Required'), seasons: z.string().min(1, 'Comma-separated, e.g. Rabi'),
  rain_min_mm: z.coerce.number(), rain_max_mm: z.coerce.number(), temp_min_c: z.coerce.number(), temp_max_c: z.coerce.number(),
  suitable_soils: z.array(z.enum(SOIL_TYPES)).min(1, 'Choose at least one'), water_sensitivity: z.enum(['low', 'medium', 'high']),
  seed_kg_per_decimal: z.coerce.number().positive('Above 0'), npk_note: z.string().optional(),
}).refine((v) => v.rain_max_mm > v.rain_min_mm, { path: ['rain_max_mm'], message: 'Must exceed minimum' }).refine((v) => v.temp_max_c > v.temp_min_c, { path: ['temp_max_c'], message: 'Must exceed minimum' });

function CropsTab() {
  const toast = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [delCrop, setDelCrop] = useState<Crop | null>(null);
  const q = useQuery({ queryKey: queryKeys.admin('crops', {}), queryFn: async () => (await api.get<Crop[]>('/admin/crops')).data });
  const refresh = () => { void qc.invalidateQueries({ queryKey: ['admin', 'crops'] }); void qc.invalidateQueries({ queryKey: queryKeys.crops }); };
  const create = useMutation<Crop, AppError, object>({ mutationFn: async (b) => (await api.post<Crop>('/admin/crops', b)).data, onSuccess: () => { toast.success('Crop added'); setOpen(false); refresh(); }, onError: (e) => toast.error(e.message) });
  const patch = useMutation<Crop, AppError, Crop>({ mutationFn: async (c) => (await api.patch<Crop>(`/admin/crops/${c.id}`, { is_active: !c.is_active })).data, onSuccess: refresh, onError: (e) => toast.error(e.message) });
  const del = useMutation<unknown, AppError, string>({ mutationFn: async (id) => (await api.delete(`/admin/crops/${id}`)).data, onSuccess: () => { toast.success('Crop deleted'); refresh(); }, onError: (e) => toast.error(e.message) });
  const f = useForm<z.input<typeof cropSchema>, unknown, z.output<typeof cropSchema>>({ resolver: zodResolver(cropSchema), defaultValues: { suitable_soils: [], water_sensitivity: 'medium' } });
  const e = f.formState.errors;
  const num = (k: 'rain_min_mm' | 'rain_max_mm' | 'temp_min_c' | 'temp_max_c' | 'seed_kg_per_decimal', label: string) => <FormField label={label} error={e[k]?.message}>{(p) => <Input type="number" step="any" {...p} {...f.register(k)} />}</FormField>;
  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)}>Add crop</Button>
      <QueryState query={q} skeleton={<Skeleton className="h-32 w-full" />} isEmpty={(d) => d.length === 0} empty={{ title: 'No crops in the catalog' }}>
        {(list) => <ul className="stack-grid grid gap-3 md:grid-cols-2">{list.map((c) => (
          <li key={c.id}><Card className="space-y-2"><div className="flex items-center justify-between"><h3 className="font-semibold">{c.name_en} <span lang="bn" className="font-normal text-muted">{c.name_bn}</span></h3><Badge>{c.is_active ? 'Active' : 'Inactive'}</Badge></div>
            <p className="text-sm text-muted">Rain {c.rain_min_mm}–{c.rain_max_mm} mm · Temp {c.temp_min_c}–{c.temp_max_c} °C · {c.seasons.join(', ')}</p>
            <div className="flex gap-2"><Button variant="outline" onClick={() => patch.mutate(c)}>{c.is_active ? 'Deactivate' : 'Activate'}</Button><Button variant="danger" onClick={() => setDelCrop(c)}>Delete</Button></div></Card></li>))}</ul>}
      </QueryState>
      <ConfirmDialog open={delCrop !== null} title="Delete crop?" message={`Delete ${delCrop?.name_en ?? 'this crop'} from the catalog?`} loading={del.isPending} onCancel={() => setDelCrop(null)} onConfirm={() => delCrop && del.mutate(delCrop.id, { onSettled: () => setDelCrop(null) })} />
      <Modal open={open} onClose={() => setOpen(false)} title="Add crop">
        <form className="space-y-3" noValidate onSubmit={f.handleSubmit((v) => create.mutate({ ...v, seasons: v.seasons.split(',').map((s) => s.trim()).filter(Boolean), rotation_after: [], is_active: true, npk_note: v.npk_note || null }))}>
          <FormField label="Name (English)" error={e.name_en?.message}>{(p) => <Input {...p} {...f.register('name_en')} />}</FormField>
          <FormField label="Name (Bangla)" error={e.name_bn?.message}>{(p) => <Input lang="bn" {...p} {...f.register('name_bn')} />}</FormField>
          <FormField label="Seasons" error={e.seasons?.message}>{(p) => <Input {...p} {...f.register('seasons')} />}</FormField>
          <div className="grid grid-cols-2 gap-3">{num('rain_min_mm', 'Rain min (mm)')}{num('rain_max_mm', 'Rain max (mm)')}{num('temp_min_c', 'Temp min (°C)')}{num('temp_max_c', 'Temp max (°C)')}</div>
          <fieldset><legend className="font-semibold">Suitable soils</legend><div className="flex flex-wrap gap-3">{SOIL_TYPES.map((s) => <label key={s} className="flex min-h-tap items-center gap-2"><input type="checkbox" value={s} {...f.register('suitable_soils')} />{s.replace('_', ' ')}</label>)}</div>{e.suitable_soils && <p role="alert" className="text-sm text-danger-text">{e.suitable_soils.message}</p>}</fieldset>
          <FormField label="Water sensitivity">{(p) => <Select {...p} {...f.register('water_sensitivity')}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></Select>}</FormField>
          {num('seed_kg_per_decimal', 'Seed (kg per decimal)')}
          <FormField label="NPK note (optional)">{(p) => <Input {...p} {...f.register('npk_note')} />}</FormField>
          <Button type="submit" loading={create.isPending}>Save crop</Button>
        </form>
      </Modal>
    </div>
  );
}

function AuditTab() {
  const [page, setPage] = useState(1);
  const q = useQuery({ queryKey: queryKeys.admin('audit', { page }), placeholderData: (p) => p, queryFn: async () => (await api.get<Paginated<AuditLog>>('/admin/audit-logs', { params: { page } })).data });
  return (
    <QueryState query={q} skeleton={<Skeleton className="h-32 w-full" />} isEmpty={(d) => d.items.length === 0} empty={{ title: 'No audit entries yet' }}>
      {(d) => <div className="space-y-4"><ul className="space-y-2">{d.items.map((l) => <li key={l.id}><Card className="flex flex-wrap justify-between gap-2"><span><strong>{l.action}</strong> · {l.entity}</span><span className="text-muted">{new Date(l.created_at).toLocaleString()}</span></Card></li>)}</ul><Pagination page={d.page} size={d.size} total={d.total} onPage={setPage} /></div>}
    </QueryState>
  );
}

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('users');
  return (
    <div className="space-y-6">
      <PageHeader title="Admin" />
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
        {(['users', 'crops', 'audit'] as const).map((t) => <Button key={t} role="tab" aria-selected={tab === t} variant={tab === t ? 'primary' : 'outline'} onClick={() => setTab(t)} className="capitalize">{t === 'audit' ? 'Audit log' : t}</Button>)}
      </div>
      {tab === 'users' ? <UsersTab /> : tab === 'crops' ? <CropsTab /> : <AuditTab />}
    </div>
  );
}
