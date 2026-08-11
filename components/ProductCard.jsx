import Link from "next/link";
import { formatPrice, effectivePrice, discountPercent } from "@/lib/format";

export default function ProductCard({ product }) {
  const price = effectivePrice(product);
  const discount = discountPercent(product);
  const outOfStock = !product.stock || product.stock <= 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-lift"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-dharma-sand">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-dharma-black/30">No image</div>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-saffron-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            {discount}% OFF
          </span>
        )}
        {product.isCertified && (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-green-700 shadow">
            ✓ Certified
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-dharma-black/50 text-sm font-bold uppercase tracking-wide text-white">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-3.5 sm:p-4">
        {product.collectionName && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-saffron-600">
            {product.collectionName}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold text-dharma-black sm:text-base">
          {product.name}
        </h3>
        {product.material && (
          <p className="mt-0.5 text-[11px] text-dharma-black/50">{product.material}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold text-dharma-black sm:text-base">{formatPrice(price)}</span>
          {discount > 0 && (
            <span className="text-xs text-dharma-black/40 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
