import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-dharma-black/10 bg-dharma-black text-dharma-cream">
      <div className="container-page grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center">
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
          <p className="mt-4 text-sm leading-relaxed text-dharma-cream/60">
            Wear your faith. Live your dharma. Devotional apparel crafted for
            the modern bhakt — inspired by Mahadev, Sanskrit shlokas and Sanatan
            dharma.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-saffron-500">
            Shop
          </h4>
          <ul className="space-y-2.5 text-sm text-dharma-cream/70">
            <li>
              <Link href="/shop" className="hover:text-saffron-400">
                All Products
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=T-Shirt"
                className="hover:text-saffron-400"
              >
                T-Shirts
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=Hoodie"
                className="hover:text-saffron-400"
              >
                Hoodies
              </Link>
            </li>
            <li>
              <Link
                href="/shop?collection=Mahadev%20Collection"
                className="hover:text-saffron-400"
              >
                Mahadev Collection
              </Link>
            </li>
            <li>
              <Link href="/shop?sort=newest" className="hover:text-saffron-400">
                New Arrivals
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-saffron-500">
            Account
          </h4>
          <ul className="space-y-2.5 text-sm text-dharma-cream/70">
            <li>
              <Link href="/account" className="hover:text-saffron-400">
                My Account
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="hover:text-saffron-400">
                Order History
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-saffron-400">
                My Cart
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-saffron-400">
                Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-saffron-500">
            Support
          </h4>
          <ul className="space-y-2.5 text-sm text-dharma-cream/70">
            <li>Cash on Delivery available</li>
            <li>Secure payments via Razorpay</li>
            <li>support@devbhakt.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="container-page text-center text-xs text-dharma-cream/50">
          © {new Date().getFullYear()} DevBhakt. All rights reserved. Om Namah
          Shivaya 🔱
        </p>
      </div>
    </footer>
  );
}
