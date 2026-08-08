"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/format";
import Loader, { EmptyState } from "@/components/Loader";
import OrderStatusBadge from "@/components/OrderStatusBadge";

export default function OrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/account/orders");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    api
      .getMyOrders()
      .then((data) => active && setOrders(data.orders || []))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  if (authLoading || (loading && isAuthenticated)) return <Loader label="Loading orders..." />;

  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="section-heading mb-6">My Orders</h1>

      <div className="mb-6 flex gap-2">
        <Link href="/account" className="chip">Profile</Link>
        <Link href="/account/orders" className="chip chip-active">My Orders</Link>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {!error && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When you place an order, it will show up here."
          actionHref="/shop"
          actionLabel="Start Shopping"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order._id}`}
              className="block rounded-2xl bg-white p-5 shadow-card transition hover:shadow-lift"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-dharma-black/40">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-1 text-sm text-dharma-black/60">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
              </div>

              <div className="mt-4 flex items-center gap-2 overflow-x-auto">
                {order.items.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-dharma-sand">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                ))}
                {order.items.length > 5 && (
                  <span className="text-xs font-semibold text-dharma-black/50">+{order.items.length - 5} more</span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-dharma-black/10 pt-3">
                <span className="text-xs font-semibold uppercase text-dharma-black/40">
                  {order.paymentMethod === "COD" ? "Cash on Delivery" : order.isPaid ? "Paid Online" : "Payment Pending"}
                </span>
                <span className="text-sm font-bold text-dharma-black">{formatPrice(order.totalPrice)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
