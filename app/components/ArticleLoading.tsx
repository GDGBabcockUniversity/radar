export default function ArticleLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-content">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="flex flex-col items-center gap-4"
      >
        <span
          aria-hidden="true"
          className="h-8 w-8 rounded-full border-2 border-edge border-t-primary motion-safe:animate-spin"
        />
        <p className="text-sm text-content-muted">Loading article…</p>
      </div>
    </main>
  );
}
