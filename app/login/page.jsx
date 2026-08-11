"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function LoginForm() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(form.email, form.password);
      showToast("Welcome back!");
      // Respect an explicit redirect (e.g. back to checkout). Otherwise send
      // admins straight to the admin dashboard and everyone else to their account.
      router.push(redirect || (user?.role === "admin" ? "/admin" : "/account"));
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
          <Image
            src="/logo.png"
            alt="Kartikeyo"
            width={56}
            height={56}
            className="mb-3 h-14 w-14"
          />
          <h1 className="font-serif text-2xl font-bold text-dharma-black">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-dharma-black/50">
            Login to continue your journey with Kartikeyo
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="label-field">Password</label>
              <Link
                href="/forgot-password"
                className="mb-1.5 text-xs font-semibold text-saffron-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dharma-black/60">
          New to Kartikeyo?{" "}
          <Link
            href="/register"
            className="font-semibold text-saffron-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
