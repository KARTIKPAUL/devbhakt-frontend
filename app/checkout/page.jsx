"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { loadRazorpayScript } from "@/lib/razorpay";
import Loader from "@/components/Loader";

const EMPTY_ADDRESS = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

export default function CheckoutPage() {
  const { user, isAuthenticated, loading: authLoading, refreshProfile } = useAuth();
  const { items, subtotal, clearCart, hydrated } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/checkout");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    api
      .getProfile()
      .then((data) => {
        if (!active) return;
        const addrs = data.user?.addresses || [];
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) setSelectedAddressId(def._id);
        else setShowNewAddress(true);
      })
      .catch(() => {})
      .finally(() => active && setLoadingAddresses(false));
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (hydrated && items.length === 0 && !placing) {
      router.replace("/cart");
    }
  }, [hydrated, items, placing, router]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const data = await api.addAddress(newAddress);
      setAddresses(data.addresses);
      const added = data.addresses[data.addresses.length - 1];
      setSelectedAddressId(added._id);
      setShowNewAddress(false);
      setNewAddress(EMPTY_ADDRESS);
      showToast("Address saved");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddress) {
      showToast("Please select or add a shipping address", "error");
      return;
    }

    setPlacing(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size })),
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: selectedAddress.country || "India",
        },
        paymentMethod,
      };

      const { order } = await api.createOrder(orderPayload);

      if (paymentMethod === "COD") {
        clearCart();
        showToast("Order placed successfully!");
        router.push(`/order-success/${order._id}`);
        return;
      }

      // ONLINE via Razorpay
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast("Could not load Razorpay. Please try again.", "error");
        setPlacing(false);
        return;
      }

      const rzpData = await api.createRazorpayOrder(order._id);

      const rzp = new window.Razorpay({
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "DevBhakt",
        description: "Order Payment",
        image: "/logo.png",
        order_id: rzpData.razorpayOrderId,
        prefill: {
          name: selectedAddress.fullName,
          contact: selectedAddress.phone,
          email: user?.email,
        },
        theme: { color: "#e8590c" },
        handler: async (response) => {
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            showToast("Payment successful! Order confirmed.");
            router.push(`/order-success/${order._id}`);
          } catch (err) {
            showToast(err.message || "Payment verification failed", "error");
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      });

      rzp.on("payment.failed", () => {
        showToast("Payment failed. Please try again.", "error");
        setPlacing(false);
      });

      rzp.open();
    } catch (err) {
      showToast(err.message || "Could not place order", "error");
      setPlacing(false);
    }
  };

  if (authLoading || !isAuthenticated || (loadingAddresses && addresses.length === 0)) {
    return <Loader label="Preparing checkout..." />;
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <h1 className="section-heading mb-8">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="space-y-6 lg:col-span-2">
          {/* Address selection */}
          <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
            <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Shipping Address</h2>

            {addresses.length > 0 && (
              <div className="mb-4 space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${
                      selectedAddressId === addr._id ? "border-saffron-600 bg-saffron-50" : "border-dharma-black/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1 accent-saffron-600"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-dharma-black">
                        {addr.fullName} <span className="ml-1 rounded bg-dharma-sand px-1.5 py-0.5 text-[10px] font-bold uppercase text-dharma-black/60">{addr.label}</span>
                      </p>
                      <p className="mt-0.5 text-dharma-black/60">
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-dharma-black/60">Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {!showNewAddress ? (
              <button
                onClick={() => setShowNewAddress(true)}
                className="text-sm font-semibold text-saffron-700 hover:underline"
              >
                + Add a new address
              </button>
            ) : (
              <form onSubmit={handleSaveAddress} className="mt-2 space-y-4 rounded-xl border border-dharma-black/10 p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label-field">Full Name</label>
                    <input required className="input-field" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-field">Phone</label>
                    <input required className="input-field" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label-field">Address Line 1</label>
                  <input required className="input-field" value={newAddress.addressLine1} onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })} />
                </div>
                <div>
                  <label className="label-field">Address Line 2 (optional)</label>
                  <input className="input-field" value={newAddress.addressLine2} onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label-field">City</label>
                    <input required className="input-field" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-field">State</label>
                    <input required className="input-field" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-field">Pincode</label>
                    <input required className="input-field" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-dharma-black/70">
                  <input type="checkbox" className="accent-saffron-600" checked={newAddress.isDefault} onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })} />
                  Set as default address
                </label>
                <div className="flex gap-3">
                  <button type="submit" disabled={savingAddress} className="btn-primary">
                    {savingAddress ? "Saving..." : "Save Address"}
                  </button>
                  {addresses.length > 0 && (
                    <button type="button" onClick={() => setShowNewAddress(false)} className="btn-secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Payment method */}
          <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
            <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Payment Method</h2>
            <div className="space-y-3">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${paymentMethod === "COD" ? "border-saffron-600 bg-saffron-50" : "border-dharma-black/10"}`}>
                <input type="radio" name="payment" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="accent-saffron-600" />
                <div>
                  <p className="text-sm font-semibold text-dharma-black">Cash on Delivery</p>
                  <p className="text-xs text-dharma-black/50">Pay when your order arrives</p>
                </div>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${paymentMethod === "ONLINE" ? "border-saffron-600 bg-saffron-50" : "border-dharma-black/10"}`}>
                <input type="radio" name="payment" checked={paymentMethod === "ONLINE"} onChange={() => setPaymentMethod("ONLINE")} className="accent-saffron-600" />
                <div>
                  <p className="text-sm font-semibold text-dharma-black">Pay Online</p>
                  <p className="text-xs text-dharma-black/50">UPI, Cards, Netbanking via Razorpay</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-2xl bg-white p-5 shadow-card sm:p-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Order Summary</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="flex justify-between gap-3 text-sm">
                <div className="flex-1">
                  <p className="font-medium text-dharma-black">
                    {item.name} {item.size && <span className="text-dharma-black/50">({item.size})</span>}
                  </p>
                  <p className="text-xs text-dharma-black/50">Qty: {item.quantity}</p>
                </div>
                <span className="whitespace-nowrap font-semibold text-dharma-black">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="my-4 h-px bg-dharma-black/10" />
          <div className="flex justify-between text-sm text-dharma-black/70">
            <span>Subtotal</span>
            <span className="font-semibold text-dharma-black">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-dharma-black/70">
            <span>Shipping</span>
            <span className="font-semibold text-dharma-black">Calculated by seller</span>
          </div>
          <div className="my-4 h-px bg-dharma-black/10" />
          <div className="flex justify-between text-base font-bold text-dharma-black">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary mt-6 w-full">
            {placing ? "Placing Order..." : paymentMethod === "COD" ? "Place Order" : "Pay & Place Order"}
          </button>
          <Link href="/cart" className="mt-3 block text-center text-xs font-semibold text-saffron-700 hover:underline">
            ← Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
