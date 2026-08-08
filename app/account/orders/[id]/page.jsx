"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/format";
import Loader from "@/components/Loader";
import OrderStatusBadge from "@/components/OrderStatusBadge";

const TIMELINE = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?redirect=/account/orders/${id}`);
    }
  }, [authLoading, isAuthenticated, router, id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    api
      .getOrder(id)
      .then((data) => active && setOrder(data.order))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isAuthenticated]);

  if (authLoading || loading) return <Loader label="Loading order..." />;

  if (error || !order) {
    return (
      <div className="container-page py-20 text-center">
        <h2 className="section-heading">Order not found</h2>
        <p className="mt-2 text-sm text-dharma-black/60">{error}</p>
        <Link href="/account/orders" className="btn-primary mt-6 inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === "CANCELLED" || order.orderStatus === "RETURNED";
  const currentStep = TIMELINE.indexOf(order.orderStatus);

  return (
    <div className="container-page py-8 sm:py-12">
      <Link href="/account/orders" className="mb-4 inline-block text-xs font-semibold text-saffron-700 hover:underline">
        ← Back to Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="section-heading">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-dharma-black/50">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="mt-8 rounded-2xl bg-white p-5 shadow-card sm:p-6">
          <div className="flex items-center justify-between">
            {TIMELINE.map((step, idx) => (
              <div key={step} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div
                    className={`mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      idx <= currentStep ? "bg-saffron-600 text-white" : "bg-dharma-sand text-dharma-black/40"
                    }`}
                  >
                    {idx < currentStep ? "✓" : idx + 1}
                  </div>
                  {idx < TIMELINE.length - 1 && (
                    <div className={`h-0.5 flex-1 ${idx < currentStep ? "bg-saffron-600" : "bg-dharma-sand"}`} />
                  )}
                </div>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-dharma-black/50 sm:text-xs">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
            <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-dharma-sand">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dharma-black">{item.name}</p>
                    {item.size && <p className="text-xs text-dharma-black/50">Size: {item.size}</p>}
                    <p className="text-xs text-dharma-black/50">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-dharma-black">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
            <h2 className="mb-3 font-serif text-lg font-bold text-dharma-black">Shipping Address</h2>
            <p className="text-sm text-dharma-black/70">
              {order.shippingAddress.fullName} · {order.shippingAddress.phone}
            </p>
            <p className="mt-1 text-sm text-dharma-black/70">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""},{" "}
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl bg-white p-5 shadow-card sm:p-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Payment Summary</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-dharma-black/70">
              <span>Items</span>
              <span className="font-semibold text-dharma-black">{formatPrice(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between text-dharma-black/70">
              <span>Shipping</span>
              <span className="font-semibold text-dharma-black">{formatPrice(order.shippingPrice)}</span>
            </div>
          </div>
          <div className="my-4 h-px bg-dharma-black/10" />
          <div className="flex justify-between text-base font-bold text-dharma-black">
            <span>Total</span>
            <span>{formatPrice(order.totalPrice)}</span>
          </div>
          <div className="mt-4 rounded-lg bg-dharma-sand p-3 text-xs text-dharma-black/60">
            <p>
              <span className="font-semibold text-dharma-black">Payment Method:</span>{" "}
              {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-dharma-black">Status:</span>{" "}
              {order.isPaid ? `Paid on ${formatDate(order.paidAt)}` : "Payment Pending"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
