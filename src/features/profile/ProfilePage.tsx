import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Input } from '@/components/ui/FormField';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/error';
import { queryKeys } from '@/lib/queryKeys';
import type { User } from '@/types/api';

const profileSchema = z.object({ name: z.string().min(2, 'Enter your name'), phone: z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, 'Enter a Bangladesh mobile number') });
const pwSchema = z.object({ current_password: z.string().min(1, 'Enter your current password'), new_password: z.string().min(8, 'Use at least 8 characters') });

function usePatchMe<T extends object>(okMsg: string, onDone?: () => void) {
  const qc = useQueryClient();
  const toast = useToast();
  return useMutation<User, AppError, T>({
    mutationFn: async (b) => (await api.patch<User>('/users/me', b)).data,
    onSuccess: (u) => { qc.setQueryData(queryKeys.auth.me, u); toast.success(okMsg); onDone?.(); },
    onError: (e) => toast.error(e.message),
  });
}

export function ProfilePage() {
  const { user } = useAuth();
  const p = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), values: { name: user?.name ?? '', phone: user?.phone ?? '' } });
  const w = useForm<z.infer<typeof pwSchema>>({ resolver: zodResolver(pwSchema) });
  const saveProfile = usePatchMe<z.infer<typeof profileSchema>>('Profile updated');
  const savePw = usePatchMe<z.infer<typeof pwSchema>>('Password changed', () => w.reset());
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Profile" description={user ? `${user.email} · ${user.role}` : undefined} />
      <Card><form className="space-y-4" noValidate onSubmit={p.handleSubmit((v) => saveProfile.mutate(v))}>
        <h2 className="text-lg font-semibold">Your details</h2>
        <FormField label="Name" error={p.formState.errors.name?.message}>{(a) => <Input {...a} {...p.register('name')} />}</FormField>
        <FormField label="Mobile number" error={p.formState.errors.phone?.message}>{(a) => <Input type="tel" {...a} {...p.register('phone')} />}</FormField>
        <Button type="submit" loading={saveProfile.isPending}>Save changes</Button>
      </form></Card>
      <Card><form className="space-y-4" noValidate onSubmit={w.handleSubmit((v) => savePw.mutate(v))}>
        <h2 className="text-lg font-semibold">Change password</h2>
        <FormField label="Current password" error={w.formState.errors.current_password?.message}>{(a) => <Input type="password" autoComplete="current-password" {...a} {...w.register('current_password')} />}</FormField>
        <FormField label="New password" error={w.formState.errors.new_password?.message}>{(a) => <Input type="password" autoComplete="new-password" {...a} {...w.register('new_password')} />}</FormField>
        <Button type="submit" loading={savePw.isPending}>Change password</Button>
      </form></Card>
    </div>
  );
}
