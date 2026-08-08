"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h1 className="font-serif text-2xl font-bold text-dharma-black">Forgot Password</h1>
        <p className="mt-1 text-sm text-dharma-black/50">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="mt-6 rounded-lg bg-saffron-50 px-4 py-3 text-sm text-saffron-800">
            If that account exists, a reset email has been sent. Please check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
            <div>
              <label className="label-field">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-dharma-black/60">
          <Link href="/login" className="font-semibold text-saffron-700 hover:underline">
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
