"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/format";
import { EmptyState } from "@/components/Loader";

export default function CartPage() {
  const { items, hydrated, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <h1 className="section-heading mb-8">Your Cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore the collection and find something devotional for you."
          actionHref="/shop"
          actionLabel="Start Shopping"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="section-heading mb-8">Your Cart ({itemCount})</h1>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 rounded-2xl bg-white p-3.5 shadow-card sm:p-4"
            >
              <Link href={`/product/${item.slug}`} className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-dharma-sand sm:h-28 sm:w-24">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : null}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/product/${item.slug}`} className="text-sm font-semibold text-dharma-black hover:text-saffron-700 sm:text-base">
                    {item.name}
                  </Link>
                  {item.size && (
                    <p className="mt-1 text-xs text-dharma-black/50">Size: <span className="font-semibold">{item.size}</span></p>
                  )}
                  <p className="mt-1 text-sm font-bold text-dharma-black">{formatPrice(item.price)}</p>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-dharma-black/15">
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-sm font-bold text-dharma-black/70 hover:text-saffron-600"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-sm font-bold text-dharma-black/70 hover:text-saffron-600"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.size)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full rounded-2xl bg-white p-5 shadow-card sm:p-6 lg:w-80">
          <h2 className="font-serif text-lg font-bold text-dharma-black">Order Summary</h2>
          <div className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-dharma-black/70">
              <span>Subtotal</span>
              <span className="font-semibold text-dharma-black">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-dharma-black/70">
              <span>Shipping</span>
              <span className="font-semibold text-dharma-black">Calculated at checkout</span>
            </div>
          </div>
          <div className="my-4 h-px bg-dharma-black/10" />
          <div className="flex justify-between text-base font-bold text-dharma-black">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <button onClick={handleCheckout} className="btn-primary mt-6 w-full">
            Proceed to Checkout
          </button>
          <Link href="/shop" className="mt-3 block text-center text-xs font-semibold text-saffron-700 hover:underline">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
