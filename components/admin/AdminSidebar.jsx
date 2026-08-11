"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/products", label: "Products", icon: "👕" },
  { href: "/admin/products/new", label: "Add Product", icon: "➕" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
];

export default function AdminSidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (link) => (link.exact ? pathname === link.href : pathname.startsWith(link.href));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 transform bg-dharma-black text-dharma-cream transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5 sm:h-20">
          <Image src="/logo.png" alt="Kartikeyo" width={36} height={36} className="h-9 w-9" />
          <div className="leading-tight">
            <p className="font-serif text-lg font-bold">
              <span className="text-saffron-500">Dev</span>Bhakt
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-dharma-cream/50">
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                isActive(link)
                  ? "bg-saffron-600 text-white"
                  : "text-dharma-cream/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <p className="truncate text-xs font-semibold text-dharma-cream/60">{user?.name}</p>
          <p className="truncate text-[11px] text-dharma-cream/40">{user?.email}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/" className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-center text-xs font-semibold text-dharma-cream/70 hover:bg-white/5">
              View Store
            </Link>
            <button
              onClick={logout}
              className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
