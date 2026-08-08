"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import Loader, { ProductCardSkeleton } from "@/components/Loader";

const CATEGORIES = [
  { label: "T-Shirts", value: "T-Shirt", emoji: "👕" },
  { label: "Hoodies", value: "Hoodie", emoji: "🧥" },
  { label: "Tote Bags", value: "Tote Bag", emoji: "👜" },
];

export default function HomePage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admins land here after refreshing / bookmarking "/" too — send them
  // straight to the admin dashboard instead of the storefront.
  useEffect(() => {
    if (!authLoading && isAdmin) {
      router.replace("/admin");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [all, latest] = await Promise.all([
          api.getProducts({ limit: 8 }),
          api.getProducts({ limit: 4, sort: "newest" }),
        ]);
        if (!active) return;
        const featuredList = all.products?.filter((p) => p.isFeatured);
        setFeatured(
          featuredList?.length
            ? featuredList.slice(0, 8)
            : all.products?.slice(0, 8) || [],
        );
        setNewest(latest.products || []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (authLoading || isAdmin) {
    return <Loader label="Redirecting to admin dashboard..." />;
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-dharma-black">
        <div className="pointer-events-none absolute inset-0 bg-saffron-gradient opacity-10" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-saffron-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-saffron-600/10 blur-3xl" />

        <div className="container-page relative flex flex-col-reverse items-center gap-10 py-14 sm:py-20 lg:flex-row lg:gap-16 lg:py-28">
          <div className="w-full text-center lg:w-1/2 lg:text-left">
            <span className="inline-block rounded-full border border-saffron-500/40 bg-saffron-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-saffron-400">
              Sanatan Streetwear
            </span>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Wear Your <span className="text-saffron-500">Faith.</span>
              <br />
              Live Your <span className="text-saffron-500">Dharma.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-dharma-cream/70 sm:text-base lg:mx-0">
              Devotional t-shirts, hoodies and totes inspired by Mahadev,
              Sanskrit shlokas and the spirit of Sanatan dharma — designed for
              everyday bhakts.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/shop" className="btn-primary">
                Shop Collection
              </Link>
              <Link
                href="/shop?collection=Mahadev%20Collection"
                className="btn-outline-light"
              >
                Mahadev Collection
              </Link>
            </div>
          </div>

          <div className="flex w-full items-center justify-center lg:w-1/2">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-saffron-500/20 to-transparent sm:h-72 sm:w-72 lg:h-96 lg:w-96">
              <Image
                src="/logo.png"
                alt="DevBhakt — Wear Your Faith, Live Your Dharma"
                width={420}
                height={420}
                className="h-full w-full rounded-full object-cover shadow-lift"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category strip */}
      <section className="container-page -mt-8 relative z-10 sm:-mt-10">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/shop?category=${encodeURIComponent(cat.value)}`}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center shadow-card transition hover:-translate-y-1 hover:shadow-lift sm:p-6"
            >
              <span className="text-2xl sm:text-3xl">{cat.emoji}</span>
              <span className="text-xs font-bold uppercase tracking-wide text-dharma-black sm:text-sm">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container-page py-14 sm:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-saffron-600">
              Handpicked
            </p>
            <h2 className="section-heading">Featured Products</h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm font-semibold text-saffron-700 hover:underline sm:block"
          >
            View all →
          </Link>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Couldn&apos;t load products: {error}. Make sure your DevBhakt
            backend is running and NEXT_PUBLIC_API_URL is set correctly.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>

        {!loading && featured.length === 0 && !error && (
          <p className="py-10 text-center text-sm text-dharma-black/50">
            No products yet — add some from your admin panel to see them here.
          </p>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link href="/shop" className="btn-secondary">
            View All Products
          </Link>
        </div>
      </section>

      {/* Belief banner */}
      <section className="bg-dharma-sand py-14 sm:py-16">
        <div className="container-page grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
          {[
            {
              title: "Crafted with Bhakti",
              desc: "Every design carries meaning — rooted in scripture, symbolism and devotion.",
            },
            {
              title: "Premium Comfort",
              desc: "Soft, breathable fabric built for daily wear, satsang and everything between.",
            },
            {
              title: "COD & Secure Payments",
              desc: "Pay online via Razorpay or choose Cash on Delivery — your choice, always.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-2 px-4"
            >
              <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-saffron-600/10 text-saffron-700">
                🔱
              </div>
              <h3 className="font-serif text-lg font-bold text-dharma-black">
                {item.title}
              </h3>
              <p className="text-sm text-dharma-black/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      {(newest.length > 0 || loading) && (
        <section className="container-page py-14 sm:py-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-saffron-600">
                Just Dropped
              </p>
              <h2 className="section-heading">New Arrivals</h2>
            </div>
            <Link
              href="/shop?sort=newest"
              className="hidden text-sm font-semibold text-saffron-700 hover:underline sm:block"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : newest.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>
        </section>
      )}
    </div>
  );
}
