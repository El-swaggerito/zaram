import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B4A32] text-[#F7F3EA]">

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-12 lg:py-24">

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">

          {/* Brand */}
          <div className="space-y-4">

            <p className="font-serif text-lg font-semibold text-[#F7F3EA]">
              Zaram Hotels
            </p>

            <p className="max-w-xs text-[13px] leading-6 text-[#DFE4DA]">
              An architectural sanctuary of organic garden serene hospitality
              and timeless luxury accommodations.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">

            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
              Navigate
            </h3>

            <ul className="space-y-2 text-[13px] text-[#DFE4DA]">

              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-[#F7F3EA]"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/rooms"
                  className="transition-colors hover:text-[#F7F3EA]"
                >
                  Rooms
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-[#F7F3EA]"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-[#F7F3EA]"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  href="/contact#reservation"
                  className="transition-colors hover:text-[#F7F3EA]"
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">

            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
              Contact
            </h3>

            <ul className="space-y-3 text-[13px] leading-5 text-[#DFE4DA]">

              <li>
                <span className="block text-[11px] font-semibold text-[#F7F3EA]">
                  Phone
                </span>

                <a
                  href="tel:+2340000000000"
                  className="transition-colors hover:text-white"
                >
                  +234 XXX XXX XXXX
                </a>
              </li>

              <li>
                <span className="block text-[11px] font-semibold text-[#F7F3EA]">
                  Email
                </span>

                <a
                  href="mailto:hello@zaramhotels.com"
                  className="transition-colors hover:text-white"
                >
                  hello@zaramhotels.com
                </a>
              </li>

              <li>
                <span className="block text-[11px] font-semibold text-[#F7F3EA]">
                  Address
                </span>

                City, State, Nigeria
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">

            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
              Follow
            </h3>

            <ul className="space-y-2 text-[13px] text-[#DFE4DA]">

              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-[#F7F3EA]"
                >
                  Instagram
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-[#F7F3EA]"
                >
                  Facebook
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-[#F7F3EA]"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-16 flex flex-col gap-4 border-t border-[#F7F3EA]/10 pt-6 text-[13px] text-[#DFE4DA] md:flex-row md:items-center md:justify-between">

          <p>
            © 2026 Zaram Hotels and Garden. All rights reserved.
          </p>

          <div className="flex items-center gap-6">

            <a
              href="#"
              className="transition-colors hover:text-[#F7F3EA]"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="transition-colors hover:text-[#F7F3EA]"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
