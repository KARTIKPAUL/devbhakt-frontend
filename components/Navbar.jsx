"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { formatPrice, effectivePrice } from "@/lib/format";

const NAV_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?category=T-Shirt", label: "T-Shirts" },
  { href: "/shop?category=Hoodie", label: "Hoodies" },
  {
    href: "/shop?collection=Mahadev%20Collection",
    label: "Mahadev Collection",
  },
];

// How many products to pull into the client-side suggestion cache. The
// backend's $text index only matches whole words, so partial queries like
// "maha" wouldn't find "Mahadev" — instead we cache a batch of products once
// and filter them locally (substring match), exactly like the admin product
// search, so suggestions appear as soon as the user starts typing.
const SUGGESTION_CACHE_LIMIT = 50;
const MAX_SUGGESTIONS = 6;
const DEBOUNCE_MS = 120;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const productCacheRef = useRef(null);
  const debounceRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Lazily fetch a batch of products the first time the search bar is opened,
  // then reuse that cache for every keystroke — no network call per letter.
  useEffect(() => {
    if (!searchOpen || productCacheRef.current) return;
    let active = true;
    setSuggestionsLoading(true);
    api
      .getProducts({ limit: SUGGESTION_CACHE_LIMIT, sort: "newest" })
      .then((data) => {
        if (!active) return;
        productCacheRef.current = data.products || [];
      })
      .catch(() => {
        if (active) productCacheRef.current = [];
      })
      .finally(() => {
        if (active) setSuggestionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [searchOpen]);

  // Debounced local filtering — matches on name, category and collection,
  // the same simple substring approach used in the admin product search.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const query = search.trim().toLowerCase();
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const pool = productCacheRef.current || [];
      const matches = pool
        .filter(
          (p) =>
            p.name?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query) ||
            p.collectionName?.toLowerCase().includes(query),
        )
        .slice(0, MAX_SUGGESTIONS);
      setSuggestions(matches);
      setShowSuggestions(true);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Close the dropdown (and the whole search bar) on outside click.
  useEffect(() => {
    if (!searchOpen) return;
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  // The admin panel has its own sidebar/layout — never render the storefront
  // navbar on top of it.
  if (pathname?.startsWith("/admin")) return null;

  const toggleSearch = () => {
    setSearchOpen((prev) => {
      const next = !prev;
      if (!next) {
        setSearch("");
        setShowSuggestions(false);
      }
      return next;
    });
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setShowSuggestions(false);
    setSearch("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
      closeSearch();
    }
  };

  const handleSuggestionClick = (product) => {
    router.push(`/product/${product.slug}`);
    setMenuOpen(false);
    closeSearch();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      closeSearch();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-dharma-black/10 bg-dharma-cream/95 backdrop-blur">
      {/* Top strip */}

      <div className="container-page flex h-16 items-center justify-between gap-3 sm:h-20">
        {/* Mobile menu button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-dharma-black lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setMenuOpen(false)}
        >
          
          {/* Compact icon + wordmark for mobile/tablet — no room for the tagline yet */}
          <Image
            src="/DevBhakt_Logos/devbhakt-icon-logo.png"
            alt="DevBhakt"
            width={206}
            height={82}
            className="h-9 w-auto sm:h-10 lg:hidden"
            priority
          />
          {/* Full lockup with tagline once we have desktop-width real estate */}
          <Image
            src="/DevBhakt_Logos/devbhakt-header-logo.png"
            alt="DevBhakt — Wear your faith, live your dharma"
            width={255}
            height={94}
            className="hidden h-14 w-auto lg:block"
            priority
          />
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
            onClick={toggleSearch}
            aria-label="Search"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
          </button>

          <Link
            href={isAuthenticated ? "/account" : "/login"}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-dharma-black transition hover:bg-saffron-100 hover:text-saffron-700 sm:flex"
            aria-label="Account"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
            </svg>
          </Link>

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-dharma-black transition hover:bg-saffron-100 hover:text-saffron-700"
            aria-label="Cart"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M6 6h15l-1.5 9h-12z"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path d="M6 6L4.5 3H2" strokeLinecap="round" />
              <circle
                cx="9.5"
                cy="20"
                r="1.4"
                fill="currentColor"
                stroke="none"
              />
              <circle
                cx="18"
                cy="20"
                r="1.4"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-saffron-600 px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search bar + live suggestions */}
      {searchOpen && (
        <div className="border-t border-dharma-black/10 bg-white px-4 py-3">
          <div ref={searchBoxRef} className="container-page relative">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.trim() && setShowSuggestions(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for t-shirts, hoodies, Mahadev collection..."
                className="input-field"
                autoComplete="off"
              />
              <button type="submit" className="btn-primary shrink-0 px-5">
                Search
              </button>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-dharma-black/10 bg-white shadow-lift">
                {suggestionsLoading ? (
                  <p className="px-4 py-4 text-sm text-dharma-black/50">
                    Loading suggestions...
                  </p>
                ) : suggestions.length > 0 ? (
                  <>
                    {suggestions.map((product) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => handleSuggestionClick(product)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-dharma-sand"
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-dharma-sand">
                          {product.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-dharma-black">
                            {product.name}
                          </p>
                          <p className="text-xs text-dharma-black/50">
                            {product.category}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-bold text-dharma-black">
                          {formatPrice(effectivePrice(product))}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="w-full border-t border-dharma-black/10 px-4 py-2.5 text-center text-xs font-semibold text-saffron-700 hover:bg-saffron-50"
                    >
                      View all results for &quot;{search}&quot; →
                    </button>
                  </>
                ) : (
                  <p className="px-4 py-4 text-sm text-dharma-black/50">
                    No products found for &quot;{search}&quot;
                  </p>
                )}
              </div>
            )}
          </div>
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
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm font-semibold uppercase tracking-wide text-dharma-black/80"
                >
                  My Account {user?.name ? `(${user.name.split(" ")[0]})` : ""}
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm font-semibold uppercase tracking-wide text-dharma-black/80"
                >
                  My Orders
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="py-3 text-sm font-semibold uppercase tracking-wide text-saffron-700"
                  >
                    Admin Panel
                  </Link>
                )}
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
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-semibold uppercase tracking-wide text-saffron-700"
              >
                Login / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
