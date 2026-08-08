"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import Loader from "@/components/Loader";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    api
      .getOrder(id)
      .then((data) => active && setOrder(data.order))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isAuthenticated]);

  if (authLoading || loading) return <Loader label="Confirming your order..." />;

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-saffron-100 text-4xl">🔱</div>
      <h1 className="mt-6 font-serif text-3xl font-bold text-dharma-black">Order Placed Successfully!</h1>
      <p className="mt-2 max-w-md text-sm text-dharma-black/60">
        Thank you for shopping with DevBhakt. Your devotional order is on its way to being blessed and
        shipped to you.
      </p>

      {order && (
        <div className="mt-6 rounded-2xl bg-white px-6 py-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-dharma-black/40">
            Order #{order._id.slice(-8).toUpperCase()}
          </p>
          <p className="mt-1 text-lg font-bold text-dharma-black">{formatPrice(order.totalPrice)}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href={`/account/orders/${id}`} className="btn-primary">
          Track Order
        </Link>
        <Link href="/shop" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
