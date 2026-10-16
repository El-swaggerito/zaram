import type { Metadata } from "next";

import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EA] pt-20">
      <section className="grid min-h-[calc(100vh-80px)] grid-cols-1 lg:grid-cols-2">
        <div className="hidden bg-[#00321F] lg:flex lg:items-center">
          <div className="mx-auto max-w-xl px-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#FFDF9D]">
              Zaram Hotels & Garden
            </p>

            <h2 className="mt-5 font-serif text-5xl font-semibold leading-tight text-white">
              Hotel Management
            </h2>

            <p className="mt-6 max-w-md text-[15px] leading-8 text-white/70">
              Manage reservations, room availability, guests and daily hotel
              operations from one secure dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-16 sm:px-8">
          <div className="w-full max-w-md">
            <AdminLoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
