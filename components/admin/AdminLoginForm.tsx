"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginResponse = {
  success: boolean;
  error?: string;
};

export default function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("zaramhotel10@gmail.com");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to sign in.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full border border-[#0B4A32]/10 bg-white p-7 shadow-[0_20px_60px_rgba(0,50,31,0.08)] sm:p-10"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#B88923]">
        Management Portal
      </p>

      <h1 className="mt-3 font-serif text-4xl font-semibold text-[#00321F]">
        Admin Login
      </h1>

      <p className="mt-4 text-sm leading-7 text-[#404943]">
        Sign in to manage bookings, guests, rooms and hotel operations.
      </p>

      <div className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
            Email
          </span>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="username"
            className="h-12 w-full border border-[#0B4A32]/20 bg-[#F7F3EA] px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
            Password
          </span>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="h-12 w-full border border-[#0B4A32]/20 bg-[#F7F3EA] px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
          />
        </label>
      </div>

      {error && (
        <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="zaram-button mt-7 inline-flex h-12 w-full items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
