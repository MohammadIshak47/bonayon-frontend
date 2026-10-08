export function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-xl p-6" role="alert">
      <h1 className="mb-2 text-2xl font-semibold">Configuration error</h1>
      <p className="text-muted">{message}</p>
    </div>
  );
}
