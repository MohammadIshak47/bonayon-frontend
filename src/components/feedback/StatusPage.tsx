import { ButtonLink } from '@/components/ui/Button';

export function StatusPage({ code, title, message }: { code?: string; title: string; message: string }) {
  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      {code && <p className="text-5xl font-semibold text-primary-text" aria-hidden="true">{code}</p>}
      <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
      <p className="mb-6 mt-2 text-muted">{message}</p>
      <ButtonLink to="/">Back to home</ButtonLink>
    </section>
  );
}
export const NotFoundPage = () => <StatusPage code="404" title="Page not found" message="That address does not exist. It may have moved." />;
export const ForbiddenPage = () => <StatusPage code="403" title="Access denied" message="You do not have permission to view this page." />;
export const ErrorPage = () => <StatusPage title="Something went wrong" message="An unexpected error occurred. Please try again." />;
