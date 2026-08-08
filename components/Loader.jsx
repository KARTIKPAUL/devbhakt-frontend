export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-dharma-black/60">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-saffron-200 border-t-saffron-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="aspect-[4/5] w-full animate-pulse bg-dharma-sand" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/2 animate-pulse rounded bg-dharma-sand" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-dharma-sand" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-dharma-sand" />
      </div>
    </div>
  );
}

export function EmptyState({ title, description, actionHref, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-dharma-black/15 bg-white/60 px-6 py-16 text-center">
      <h3 className="font-serif text-xl font-bold text-dharma-black">{title}</h3>
      {description && <p className="max-w-sm text-sm text-dharma-black/60">{description}</p>}
      {actionHref && actionLabel && (
        <a href={actionHref} className="btn-primary mt-2">
          {actionLabel}
        </a>
      )}
    </div>
  );
}
