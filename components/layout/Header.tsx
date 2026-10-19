"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  
  { label: "Contact", href: "/contact" },
];


export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#F7F3EA] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-12">

        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center"
        >
          <img
            src="/zaram.png"
            alt="Zaram Hotels & Garden Logo"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "relative pb-1 text-sm font-semibold transition-colors",
                  active
                    ? "text-[#00321F]"
                    : "text-[#404943] hover:text-[#00321F]",
                ].join(" ")}
              >
                {item.label}

                {active && (
                  <span className="absolute inset-x-0 -bottom-[2px] h-[2px] bg-[#C89D35]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">

          <Link
            href="/contact#reservation"
            className="hidden h-11 items-center justify-center bg-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] transition-colors hover:bg-[#004B2F] sm:inline-flex"
          >
            Book Now
          </Link>

          {/* Mobile menu */}
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] border border-[#0B4A32]/20 md:hidden"
          >
            <span
              className={[
                "h-px w-5 bg-[#0B4A32] transition-transform",
                menuOpen ? "translate-y-[6px] rotate-45" : "",
              ].join(" ")}
            />

            <span
              className={[
                "h-px w-5 bg-[#0B4A32] transition-opacity",
                menuOpen ? "opacity-0" : "",
              ].join(" ")}
            />

            <span
              className={[
                "h-px w-5 bg-[#0B4A32] transition-transform",
                menuOpen ? "-translate-y-[6px] -rotate-45" : "",
              ].join(" ")}
            />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-[#0B4A32]/10 bg-[#F7F3EA] md:hidden">

          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-5 sm:px-6">

            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "border-b border-[#0B4A32]/10 py-4 text-sm font-semibold",
                    active
                      ? "text-[#C89D35]"
                      : "text-[#404943]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/contact#reservation"
              onClick={() => setMenuOpen(false)}
              className="mt-5 inline-flex h-12 items-center justify-center bg-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA]"
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
