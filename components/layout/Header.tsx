"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-[#F7F3EA] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 sm:px-6 lg:px-10">

        {/* Temporary logo until original asset is added */}
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight text-[#0B4A32]"
        >
          Zaram Hotels & Garden
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "relative py-2 text-sm font-semibold transition-colors",
                  active
                    ? "text-[#0B4A32]"
                    : "text-[#404943] hover:text-[#0B4A32]",
                ].join(" ")}
              >
                {item.label}

                {active && (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#C89D35]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden h-11 items-center justify-center bg-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] transition-colors hover:bg-[#145038] sm:inline-flex"
          >
            Book Now
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 border border-[#0B4A32]/20 md:hidden"
          >
            <span
              className={[
                "h-px w-5 bg-[#0B4A32] transition-transform",
                menuOpen ? "translate-y-[7px] rotate-45" : "",
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
                menuOpen ? "-translate-y-[7px] -rotate-45" : "",
              ].join(" ")}
            />
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="border-t border-[#0B4A32]/10 bg-[#F7F3EA] px-5 py-6 md:hidden">
          <nav className="flex flex-col gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={[
                  "text-sm font-semibold",
                  pathname === item.href
                    ? "text-[#C89D35]"
                    : "text-[#0B4A32]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex h-12 items-center justify-center bg-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA]"
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
