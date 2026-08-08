"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.resetPassword(token, { password });
      showToast("Password reset successfully. Please log in.");
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card sm:p-8">
        <h1 className="font-serif text-2xl font-bold text-dharma-black">Reset Password</h1>
        <p className="mt-1 text-sm text-dharma-black/50">Enter your new password below.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
          <div>
            <label className="label-field">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Confirm Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input-field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-dharma-black/60">
          <Link href="/login" className="font-semibold text-saffron-700 hover:underline">
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
