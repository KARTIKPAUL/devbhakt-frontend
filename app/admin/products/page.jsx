"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useToast } from "@/context/ToastContext";
import Loader, { EmptyState } from "@/components/Loader";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadProducts = () => {
    setLoading(true);
    api
      .getAllProductsAdmin()
      .then((data) => setProducts(data.products || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeactivate = async (product) => {
    if (!confirm(`Deactivate "${product.name}"? It will be hidden from the storefront.`)) return;
    setBusyId(product._id);
    try {
      await api.deleteProduct(product._id);
      showToast("Product deactivated");
      setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, isActive: false } : p)));
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loader label="Loading products..." />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-heading">Products</h1>
          <p className="mt-1 text-sm text-dharma-black/50">{products.length} total products</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + Add Product
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Add your first product to get started."
          actionHref="/admin/products/new"
          actionLabel="Add Product"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dharma-black/10 bg-dharma-sand/50 text-xs font-semibold uppercase tracking-wide text-dharma-black/50">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product._id} className="border-b border-dharma-black/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-dharma-sand">
                          {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-semibold text-dharma-black">{product.name}</p>
                          {product.isFeatured && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-saffron-600">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dharma-black/70">{product.category}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-dharma-black">{formatPrice(product.discountPrice || product.price)}</span>
                      {product.discountPrice && (
                        <span className="ml-1.5 text-xs text-dharma-black/40 line-through">{formatPrice(product.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={product.stock <= 5 ? "font-semibold text-red-600" : "text-dharma-black/70"}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                          product.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="rounded-lg border border-dharma-black/15 px-3 py-1.5 text-xs font-semibold text-dharma-black hover:border-saffron-600 hover:text-saffron-700"
                        >
                          Edit
                        </Link>
                        {product.isActive && (
                          <button
                            onClick={() => handleDeactivate(product)}
                            disabled={busyId === product._id}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {busyId === product._id ? "..." : "Deactivate"}
                          </button>
                        )}
                      </div>
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
