"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPrice, effectivePrice, discountPercent } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import Loader from "@/components/Loader";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .getProduct(slug)
      .then((data) => {
        if (!active) return;
        setProduct(data.product);
        setSelectedSize(data.product.sizes?.[0] || null);
        setActiveImage(0);
        setQuantity(1);
        if (data.product.category) {
          api
            .getProducts({ category: data.product.category, limit: 4 })
            .then((r) => active && setRelated((r.products || []).filter((p) => p._id !== data.product._id)))
            .catch(() => {});
        }
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) return <Loader label="Loading product..." />;

  if (error || !product) {
    return (
      <div className="container-page py-20 text-center">
        <h2 className="section-heading">Product not found</h2>
        <p className="mt-2 text-sm text-dharma-black/60">{error || "This product may have been removed."}</p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Back to Shop
        </Link>
      </div>
    );
  }

  const price = effectivePrice(product);
  const discount = discountPercent(product);
  const outOfStock = !product.stock || product.stock <= 0;
  const needsSize = product.sizes && product.sizes.length > 0;
  const canAdd = !outOfStock && (!needsSize || selectedSize);

  const handleAddToCart = () => {
    if (!canAdd) {
      if (needsSize && !selectedSize) showToast("Please select a size", "error");
      return;
    }
    addItem(product, selectedSize, quantity);
    showToast(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (!canAdd) {
      if (needsSize && !selectedSize) showToast("Please select a size", "error");
      return;
    }
    addItem(product, selectedSize, quantity);
    router.push("/checkout");
  };

  return (
    <div className="container-page py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-dharma-black/50">
        <Link href="/" className="hover:text-saffron-600">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-saffron-600">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-saffron-600">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-dharma-black/80">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-dharma-sand">
            {product.images?.[activeImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-dharma-black/30">No image</div>
            )}
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-saffron-600 px-3 py-1 text-xs font-bold text-white shadow">
                {discount}% OFF
              </span>
            )}
          </div>

          {product.images?.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={img + idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 sm:h-20 sm:w-20 ${
                    activeImage === idx ? "border-saffron-600" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.collectionName && (
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-saffron-600">
              {product.collectionName}
            </p>
          )}
          <h1 className="font-serif text-2xl font-bold text-dharma-black sm:text-3xl">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-dharma-black sm:text-3xl">{formatPrice(price)}</span>
            {discount > 0 && (
              <>
                <span className="text-base text-dharma-black/40 line-through">{formatPrice(product.price)}</span>
                <span className="rounded-full bg-saffron-100 px-2.5 py-1 text-xs font-bold text-saffron-700">
                  Save {discount}%
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs font-medium text-dharma-black/50">Inclusive of all taxes</p>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-dharma-black/70">
            {product.description}
          </p>

          {needsSize && (
            <div className="mt-6">
              <h3 className="label-field">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 min-w-[44px] rounded-lg border-2 px-3 text-sm font-semibold transition ${
                      selectedSize === size
                        ? "border-saffron-600 bg-saffron-600 text-white"
                        : "border-dharma-black/15 text-dharma-black hover:border-saffron-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="label-field">Quantity</h3>
            <div className="flex w-fit items-center rounded-lg border border-dharma-black/15">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-lg font-bold text-dharma-black/70 hover:text-saffron-600"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                className="flex h-11 w-11 items-center justify-center text-lg font-bold text-dharma-black/70 hover:text-saffron-600"
              >
                +
              </button>
            </div>
            {!outOfStock && product.stock <= 5 && (
              <p className="mt-2 text-xs font-semibold text-saffron-700">Only {product.stock} left in stock!</p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleAddToCart} disabled={!canAdd} className="btn-secondary flex-1">
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button onClick={handleBuyNow} disabled={!canAdd} className="btn-primary flex-1">
              Buy Now
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 rounded-xl bg-dharma-sand p-4 text-xs text-dharma-black/60 sm:grid-cols-3">
            <div className="flex items-center gap-2">🔱 <span>Blessed Design</span></div>
            <div className="flex items-center gap-2">💳 <span>COD & Online Pay</span></div>
            <div className="flex items-center gap-2">🚚 <span>Pan-India Delivery</span></div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 sm:mt-24">
          <h2 className="section-heading mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
