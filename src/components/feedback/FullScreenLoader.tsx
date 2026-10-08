export function FullScreenLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="grid min-h-screen place-items-center bg-bg">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-subtle border-t-primary" aria-hidden="true" />
        <span>{label}…</span>
      </div>
    </div>
  );
}
