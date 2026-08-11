"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton, EmptyState } from "@/components/Loader";
import { PRODUCT_TYPES, getProductTypeConfig, ALL_CATEGORIES } from "@/lib/productTaxonomy";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const PAGE_SIZE = 12;
// Safety cap when pulling the full catalog for client-side search — 10 pages
// of 50 (the backend's max page size) covers up to 500 products.
const MAX_FETCH_PAGES = 10;

// The backend's $text index only matches whole words, so a query like "maha"
// won't find "Mahadev". To support real partial/substring search we instead
// fetch the filtered catalog (category/price/sort applied, no text search)
// and match products locally — the same approach used by the navbar
// suggestions and the admin product search.
async function fetchAndFilterBySearch(baseParams, query) {
  const first = await api.getProducts({ ...baseParams, page: 1, limit: 50 });
  let all = first.products || [];
  const totalPages = Math.min(first.pages || 1, MAX_FETCH_PAGES);

  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        api.getProducts({ ...baseParams, page: i + 2, limit: 50 })
      )
    );
    rest.forEach((r) => {
      all = all.concat(r.products || []);
    });
  }

  const q = query.trim().toLowerCase();
  return all.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.collectionName?.toLowerCase().includes(q) ||
      p.material?.toLowerCase().includes(q)
  );
}

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, total: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const type = searchParams.get("type") || "";
  const category = searchParams.get("category") || "";
  const collection = searchParams.get("collection") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // Category options narrow to the selected product type; show everything
  // when no type is picked yet (e.g. landing on /shop with no filters).
  const availableCategories = type ? getProductTypeConfig(type).categories : ALL_CATEGORIES;

  const updateParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === undefined || value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      if (!("page" in updates)) params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const baseParams = { type, category, collection, sort, minPrice, maxPrice };

    if (search) {
      fetchAndFilterBySearch(baseParams, search)
        .then((filtered) => {
          if (!active) return;
          const totalFiltered = filtered.length;
          const totalPagesFiltered = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
          const currentPage = Math.min(Math.max(1, page), totalPagesFiltered);
          const start = (currentPage - 1) * PAGE_SIZE;
          setProducts(filtered.slice(start, start + PAGE_SIZE));
          setPageInfo({ page: currentPage, pages: totalPagesFiltered, total: totalFiltered });
        })
        .catch((err) => active && setError(err.message))
        .finally(() => active && setLoading(false));
    } else {
      api
        .getProducts({ ...baseParams, page, limit: PAGE_SIZE })
        .then((data) => {
          if (!active) return;
          setProducts(data.products || []);
          setPageInfo({ page: data.page, pages: data.pages, total: data.total });
        })
        .catch((err) => active && setError(err.message))
        .finally(() => active && setLoading(false));
    }

    return () => {
      active = false;
    };
  }, [type, category, collection, search, sort, page, minPrice, maxPrice]);

  const activeFilterCount = [type, category, collection, minPrice, maxPrice].filter(Boolean).length;
  const currentTypeConfig = type ? getProductTypeConfig(type) : null;

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 flex flex-col gap-2 sm:mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-saffron-600">
          {search ? `Search results for "${search}"` : "Collection"}
        </p>
        <h1 className="font-serif text-2xl font-bold text-dharma-black sm:text-4xl">
          {category || collection || currentTypeConfig?.label || "All Products"}
        </h1>
        <p className="text-sm text-dharma-black/50">
          {loading ? "Loading..." : `${pageInfo.total} product${pageInfo.total === 1 ? "" : "s"} found`}
        </p>
      </div>

      {/* Product type tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => updateParams({ type: "", category: "" })}
          className={`chip ${!type ? "chip-active" : ""}`}
        >
          All
        </button>
        {PRODUCT_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => updateParams({ type: t.value, category: "" })}
            className={`chip flex items-center gap-1.5 ${type === t.value ? "chip-active" : ""}`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Mobile filter/sort toggle */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="chip flex items-center gap-1.5"
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="chip bg-white"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar filters */}
        <aside className={`w-full shrink-0 lg:block lg:w-56 ${filtersOpen ? "block" : "hidden"}`}>
          <div className="space-y-6 rounded-2xl bg-white p-5 shadow-card lg:sticky lg:top-24 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-dharma-black/60">
                Category
              </h3>
              <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start lg:gap-1.5">
                <button
                  onClick={() => updateParams({ category: "" })}
                  className={`chip ${!category ? "chip-active" : ""} lg:w-full lg:text-left`}
                >
                  All
                </button>
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateParams({ category: cat })}
                    className={`chip ${category === cat ? "chip-active" : ""} lg:w-full lg:text-left`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-dharma-black/60">
                Price Range
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={minPrice}
                  onBlur={(e) => updateParams({ minPrice: e.target.value })}
                  className="input-field py-2 text-sm"
                />
                <span className="text-dharma-black/40">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={maxPrice}
                  onBlur={(e) => updateParams({ maxPrice: e.target.value })}
                  className="input-field py-2 text-sm"
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => updateParams({ type: "", category: "", collection: "", minPrice: "", maxPrice: "" })}
                className="text-xs font-semibold text-saffron-700 hover:underline"
              >
                Clear all filters
              </button>
            )}

            {/* Desktop sort */}
            <div className="hidden lg:block">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-dharma-black/60">
                Sort By
              </h3>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="input-field py-2 text-sm"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {error && (
            <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Couldn&apos;t load products: {error}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search for something else."
              actionHref="/shop"
              actionLabel="Clear Filters"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {pageInfo.pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                    className="chip disabled:opacity-30"
                  >
                    ← Prev
                  </button>
                  <span className="px-3 text-sm font-semibold text-dharma-black/70">
                    Page {pageInfo.page} of {pageInfo.pages}
                  </span>
                  <button
                    disabled={page >= pageInfo.pages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                    className="chip disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-dharma-black/50">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}