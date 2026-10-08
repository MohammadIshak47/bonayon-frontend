import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/FormField';
import { api } from '@/lib/api';
import type { AppError } from '@/lib/error';
import { safeNextPath } from '@/lib/utils';
import type { TokenResponse } from '@/types/api';

const loginSchema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(1, 'Enter your password') });
const registerSchema = z.object({
  name: z.string().min(2, 'Enter your name'), email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, 'Enter a Bangladesh mobile number, e.g. 01712345678'),
  password: z.string().min(8, 'Use at least 8 characters'),
});
type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginPage() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const f = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const m = useMutation<TokenResponse, AppError, LoginValues>({
    // The API uses OAuth2PasswordRequestForm: form-encoded "username" + "password".
    mutationFn: async (v) => (await api.post<TokenResponse>('/auth/login', new URLSearchParams({ username: v.email, password: v.password }), { skipUnauthorizedHandler: true })).data,
    onSuccess: async (r) => { await signIn(r.access_token); nav(safeNextPath(params.get('returnUrl')), { replace: true }); },
    onError: (e) => toast.error(e.status === 401 || e.status === 400 ? t('auth.badCredentials') : e.message),
  });
  const e = f.formState.errors;
  return (
    <form onSubmit={f.handleSubmit((v) => m.mutate(v))} className="space-y-4" noValidate>
      <h1 className="text-2xl font-semibold">{t('auth.loginTitle')}</h1>
      <FormField label={t('auth.email')} error={e.email?.message}>{(p) => <Input type="email" autoComplete="email" {...p} {...f.register('email')} />}</FormField>
      <FormField label={t('auth.password')} error={e.password?.message}>{(p) => <Input type="password" autoComplete="current-password" {...p} {...f.register('password')} />}</FormField>
      <Button type="submit" className="w-full" loading={m.isPending}>{t('auth.loginButton')}</Button>
      <p className="text-center text-muted">{t('auth.noAccount')} <Link className="text-primary-text underline" to="/register">{t('navigation.register')}</Link></p>
    </form>
  );
}

export function RegisterPage() {
  const nav = useNavigate();
  const toast = useToast();
  const { t } = useLanguage();
  const f = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const m = useMutation<unknown, AppError, RegisterValues>({
    mutationFn: async (v) => (await api.post('/auth/register', v, { skipUnauthorizedHandler: true })).data,
    onSuccess: () => { toast.success(t('auth.accountCreated')); nav('/login', { replace: true }); },
    onError: (e) => {
      Object.entries(e.fieldErrors ?? {}).forEach(([k, msg]) => { if (k in registerSchema.shape) f.setError(k as keyof RegisterValues, { message: msg }); });
      toast.error(e.message);
    },
  });
  const e = f.formState.errors;
  return (
    <form onSubmit={f.handleSubmit((v) => m.mutate(v))} className="space-y-4" noValidate>
      <h1 className="text-2xl font-semibold">{t('auth.registerTitle')}</h1>
      <FormField label={t('auth.name')} error={e.name?.message}>{(p) => <Input autoComplete="name" {...p} {...f.register('name')} />}</FormField>
      <FormField label={t('auth.email')} error={e.email?.message}>{(p) => <Input type="email" autoComplete="email" {...p} {...f.register('email')} />}</FormField>
      <FormField label={t('auth.mobile')} error={e.phone?.message}>{(p) => <Input type="tel" inputMode="tel" autoComplete="tel" {...p} {...f.register('phone')} />}</FormField>
      <FormField label={t('auth.password')} hint={t('auth.passwordHint')} error={e.password?.message}>{(p) => <Input type="password" autoComplete="new-password" {...p} {...f.register('password')} />}</FormField>
      <Button type="submit" className="w-full" loading={m.isPending}>{t('auth.registerButton')}</Button>
      <p className="text-center text-muted">{t('auth.haveAccount')} <Link className="text-primary-text underline" to="/login">{t('navigation.login')}</Link></p>
    </form>
  );
}
