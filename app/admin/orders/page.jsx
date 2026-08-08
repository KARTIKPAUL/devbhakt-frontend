"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/format";
import Loader, { EmptyState } from "@/components/Loader";
import OrderStatusBadge from "@/components/OrderStatusBadge";

const STATUS_FILTERS = ["ALL", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("ALL");
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getAllOrdersAdmin({ status: status === "ALL" ? "" : status, limit: 50 })
      .then((data) => {
        if (!active) return;
        setOrders(data.orders || []);
        setPageInfo({ page: data.page, pages: data.pages, total: data.total });
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [status]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-heading">Orders</h1>
          <p className="mt-1 text-sm text-dharma-black/50">{pageInfo.total} total orders</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`chip ${status === s ? "chip-active" : ""}`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {loading ? (
        <Loader label="Loading orders..." />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" description="Orders placed by customers will show up here." />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dharma-black/10 bg-dharma-sand/50 text-xs font-semibold uppercase tracking-wide text-dharma-black/50">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-dharma-black/5 last:border-0">
                    <td className="px-4 py-3 font-semibold text-dharma-black">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-dharma-black/70">
                      <p>{order.user?.name || "—"}</p>
                      <p className="text-xs text-dharma-black/40">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-dharma-black/70">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-dharma-black/70">
                      {order.paymentMethod === "COD" ? "COD" : order.isPaid ? "Paid Online" : "Unpaid"}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.orderStatus} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-dharma-black">{formatPrice(order.totalPrice)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="rounded-lg border border-dharma-black/15 px-3 py-1.5 text-xs font-semibold text-dharma-black hover:border-saffron-600 hover:text-saffron-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
