"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

type Props = {
  admin: {
    fullName: string;
    role: string;
  };
  today: string;
  children: React.ReactNode;
};

const navigation = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/guests", label: "Guests" },
];

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/admin/bookings")) return "Bookings";
  if (pathname.startsWith("/admin/calendar")) return "Calendar";
  if (pathname.startsWith("/admin/rooms")) return "Rooms";
  if (pathname.startsWith("/admin/guests")) return "Guests";

  return "Management Dashboard";
}

export default function AdminShell({
  admin,
  today,
  children,
}: Props) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-[#F4F1E9]">
      <header className="bg-[#00321F]">
        <div className="mx-auto flex min-h-[190px] max-w-[1440px] flex-col justify-center gap-8 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#FFDF9D]">
              Zaram Hotels & Garden
            </p>

            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-white md:text-5xl">
              {title}
            </h1>

            <p className="mt-4 text-sm text-white">
              {today}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-left md:text-right">
              <p className="text-sm font-semibold text-white">
                {admin.fullName}
              </p>

              <p className="mt-1 text-xs capitalize text-white/60">
                {admin.role}
              </p>
            </div>

            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="border-b border-[#0B4A32]/10 bg-[#F7F3EA]">
        <nav className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-5 py-4 sm:px-6 lg:px-10">
          {navigation.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "whitespace-nowrap bg-[#0B4A32] px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white"
                    : "whitespace-nowrap border border-[#0B4A32]/10 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] hover:bg-[#EAE1D5]"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}
