"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import Loader from "@/components/Loader";
import OrderStatusBadge from "@/components/OrderStatusBadge";

const STATUS_OPTIONS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .getOrder(id)
      .then((data) => {
        if (!active) return;
        setOrder(data.order);
        setNextStatus(data.order.orderStatus);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const handleUpdateStatus = async () => {
    if (nextStatus === order.orderStatus) return;
    setUpdating(true);
    try {
      const data = await api.updateOrderStatus(order._id, nextStatus);
      setOrder(data.order);
      showToast(`Order marked as ${nextStatus}`);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader label="Loading order..." />;

  if (error || !order) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-red-700">{error || "Order not found"}</p>
        <Link href="/admin/orders" className="btn-primary mt-4 inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/orders" className="mb-3 inline-block text-xs font-semibold text-saffron-700 hover:underline">
        ← Back to Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="section-heading">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-dharma-black/50">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.orderStatus} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
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

          {/* Customer & address */}
          <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
            <h2 className="mb-3 font-serif text-lg font-bold text-dharma-black">Customer & Shipping</h2>
            <p className="text-sm text-dharma-black/70">
              {order.user?.name} · {order.user?.email} {order.user?.phone && `· ${order.user.phone}`}
            </p>
            <div className="my-3 h-px bg-dharma-black/10" />
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

        {/* Status update + summary */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
            <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Update Status</h2>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              className="input-field"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={updating || nextStatus === order.orderStatus}
              className="btn-primary mt-3 w-full"
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
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
                <span className="font-semibold text-dharma-black">Method:</span>{" "}
                {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-dharma-black">Paid:</span>{" "}
                {order.isPaid ? `Yes, on ${formatDate(order.paidAt)}` : "No"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
