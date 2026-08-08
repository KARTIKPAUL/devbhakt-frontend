"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      showToast("Account created! Welcome to DevBhakt 🔱");
      router.push("/account");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="DevBhakt" width={56} height={56} className="mb-3 h-14 w-14" />
          <h1 className="font-serif text-2xl font-bold text-dharma-black">Create Account</h1>
          <p className="mt-1 text-sm text-dharma-black/50">Join DevBhakt — wear your faith, live your dharma</p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Full Name</label>
            <input
              required
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Phone (optional)</label>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dharma-black/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-saffron-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
