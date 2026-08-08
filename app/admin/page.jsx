"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.getAllProductsAdmin(), api.getAllOrdersAdmin({ limit: 100 })])
      .then(([productsData, ordersData]) => {
        if (!active) return;
        const products = productsData.products || [];
        const orders = ordersData.orders || [];
        setStats({
          totalProducts: products.length,
          activeProducts: products.filter((p) => p.isActive).length,
          outOfStock: products.filter((p) => p.stock <= 0).length,
          totalOrders: ordersData.total ?? orders.length,
          pendingOrders: orders.filter((o) => ["PLACED", "CONFIRMED"].includes(o.orderStatus)).length,
          revenue: orders.filter((o) => o.isPaid || o.paymentMethod === "COD").reduce((s, o) => s + o.totalPrice, 0),
          recentOrders: orders.slice(0, 5),
        });
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    { label: "Total Products", value: stats?.totalProducts ?? "—", icon: "👕", href: "/admin/products" },
    { label: "Out of Stock", value: stats?.outOfStock ?? "—", icon: "⚠️", href: "/admin/products" },
    { label: "Total Orders", value: stats?.totalOrders ?? "—", icon: "📦", href: "/admin/orders" },
    { label: "Pending Orders", value: stats?.pendingOrders ?? "—", icon: "⏳", href: "/admin/orders" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-heading">Dashboard</h1>
          <p className="mt-1 text-sm text-dharma-black/50">Overview of your DevBhakt store</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + Add Product
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-2xl bg-white p-5 shadow-card transition hover:shadow-lift">
            <span className="text-2xl">{card.icon}</span>
            <p className="mt-2 text-2xl font-bold text-dharma-black">{loading ? "…" : card.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-dharma-black/50">{card.label}</p>
          </Link>
        ))}
      </div>

      {!loading && stats && (
        <div className="mt-4 rounded-2xl bg-white p-5 shadow-card sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-dharma-black/50">Revenue (paid + COD orders)</p>
          <p className="mt-1 text-3xl font-bold text-saffron-700">{formatPrice(stats.revenue)}</p>
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-dharma-black">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs font-semibold text-saffron-700 hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-dharma-black/50">Loading...</p>
        ) : stats?.recentOrders?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dharma-black/10 text-xs font-semibold uppercase tracking-wide text-dharma-black/50">
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o._id} className="border-b border-dharma-black/5">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/orders/${o._id}`} className="font-semibold text-saffron-700 hover:underline">
                        #{o._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-dharma-black/70">{o.user?.name || "—"}</td>
                    <td className="py-3 pr-4 text-dharma-black/70">{o.orderStatus}</td>
                    <td className="py-3 pr-4 font-semibold text-dharma-black">{formatPrice(o.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-dharma-black/50">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
