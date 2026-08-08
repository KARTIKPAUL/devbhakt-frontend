"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import Loader from "@/components/Loader";

export default function AccountPage() {
  const { user, isAuthenticated, loading: authLoading, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?redirect=/account");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || "", phone: user.phone || "" });
      setAddresses(user.addresses || []);
      setLoadingAddresses(false);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await api.updateProfile(profileForm);
      updateUser(data.user);
      showToast("Profile updated");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const data = await api.deleteAddress(addressId);
      setAddresses(data.addresses);
      showToast("Address removed");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  if (authLoading || !user) return <Loader label="Loading account..." />;

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-heading">My Account</h1>
          <p className="mt-1 text-sm text-dharma-black/50">Namaste, {user.name.split(" ")[0]} 🙏</p>
        </div>
        <button onClick={logout} className="btn-secondary">
          Logout
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        <Link href="/account" className="chip chip-active">Profile</Link>
        <Link href="/account/orders" className="chip">My Orders</Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Profile form */}
        <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Profile Details</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="label-field">Full Name</label>
              <input
                required
                className="input-field"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">Email</label>
              <input disabled className="input-field opacity-60" value={user.email} />
            </div>
            <div>
              <label className="label-field">Phone</label>
              <input
                className="input-field"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Addresses */}
        <div className="rounded-2xl bg-white p-5 shadow-card sm:p-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-dharma-black">Saved Addresses</h2>
          {loadingAddresses ? (
            <p className="text-sm text-dharma-black/50">Loading...</p>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-dharma-black/50">
              No saved addresses yet. You can add one during checkout.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div key={addr._id} className="rounded-xl border border-dharma-black/10 p-4 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-semibold text-dharma-black">
                      {addr.fullName}{" "}
                      <span className="ml-1 rounded bg-dharma-sand px-1.5 py-0.5 text-[10px] font-bold uppercase text-dharma-black/60">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="ml-1 rounded bg-saffron-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-saffron-700">
                          Default
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-dharma-black/60">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}, {addr.city}, {addr.state} -{" "}
                    {addr.pincode}
                  </p>
                  <p className="text-dharma-black/60">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
