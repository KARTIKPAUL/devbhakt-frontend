"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?category=T-Shirt", label: "T-Shirts" },
  { href: "/shop?category=Hoodie", label: "Hoodies" },
  { href: "/shop?collection=Mahadev%20Collection", label: "Mahadev Collection" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { isAuthenticated, user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearchOpen(false);
      setMenuOpen(false);
      setSearch("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-dharma-black/10 bg-dharma-cream/95 backdrop-blur">
      {/* Top strip */}
      <div className="hidden bg-dharma-black py-1.5 text-center text-[11px] font-medium tracking-wide text-saffron-200 sm:block">
        Free shipping on prepaid orders &nbsp;•&nbsp; Wear Your Faith. Live Your Dharma.
      </div>

      <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-20">
        {/* Mobile menu button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-dharma-black lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <Image src="/logo.png" alt="DevBhakt" width={44} height={44} className="h-10 w-10 sm:h-12 sm:w-12" priority />
          <span className="font-serif text-xl font-bold leading-none sm:text-2xl">
            <span className="text-saffron-600">Dev</span>
            <span className="text-dharma-black">Bhakt</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-wide text-dharma-black/80 transition hover:text-saffron-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-dharma-black transition hover:bg-saffron-100 hover:text-saffron-700"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
          </button>

          <Link
            href={isAuthenticated ? "/account" : "/login"}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-dharma-black transition hover:bg-saffron-100 hover:text-saffron-700 sm:flex"
            aria-label="Account"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
            </svg>
          </Link>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-dharma-black transition hover:bg-saffron-100 hover:text-saffron-700"
            aria-label="Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M6 6L4.5 3H2" strokeLinecap="round" />
              <circle cx="9.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-saffron-600 px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-dharma-black/10 bg-white px-4 py-3">
          <form onSubmit={handleSearch} className="container-page flex gap-2">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for t-shirts, hoodies, Mahadev collection..."
              className="input-field"
            />
            <button type="submit" className="btn-primary shrink-0 px-5">
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-dharma-black/10 bg-white lg:hidden">
          <nav className="container-page flex flex-col divide-y divide-dharma-black/10 py-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-semibold uppercase tracking-wide text-dharma-black/80"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-semibold uppercase tracking-wide text-dharma-black/80">
                  My Account {user?.name ? `(${user.name.split(" ")[0]})` : ""}
                </Link>
                <Link href="/account/orders" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-semibold uppercase tracking-wide text-dharma-black/80">
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="py-3 text-left text-sm font-semibold uppercase tracking-wide text-saffron-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-semibold uppercase tracking-wide text-saffron-700">
                Login / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
