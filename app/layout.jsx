import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";




export const metadata = {
  title: "Kartikeyo — Wear Your Faith. Live Your Dharma.",
  description:
    "Kartikeyo is a devotional clothing & lifestyle store — t-shirts, hoodies and totes inspired by Mahadev, Sanskrit shlokas and Sanatan dharma. Wear your faith, live your dharma.",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#161311",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-dharma-cream font-sans antialiased">
        <Suspense fallback={null}>
        <Analytics />
        </Suspense>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}