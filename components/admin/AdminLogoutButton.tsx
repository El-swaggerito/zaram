"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-white/10 disabled:opacity-50"
    >
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
