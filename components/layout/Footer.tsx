import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0B4A32] text-[#F7F3EA]">
      <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-6 lg:px-10 lg:py-24">

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* Brand */}
          <div>
            <p className="font-serif text-xl font-semibold text-[#F7F3EA]">
              Zaram Hotels
            </p>

            <p className="mt-5 max-w-xs text-sm leading-6 text-[#DFE4DA]">
              Comfortable accommodation, thoughtful hospitality and a
              peaceful environment for a relaxing stay.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
              Navigate
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-[#DFE4DA]">
              <li>
                <Link href="/" className="transition-colors hover:text-[#F7F3EA]">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/rooms" className="transition-colors hover:text-[#F7F3EA]">
                  Rooms
                </Link>
              </li>

              <li>
                <Link href="/about" className="transition-colors hover:text-[#F7F3EA]">
                  About
                </Link>
              </li>

              <li>
                <Link href="/contact" className="transition-colors hover:text-[#F7F3EA]">
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
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
              Contact
            </h3>

            <ul className="mt-5 space-y-4 text-sm text-[#DFE4DA]">
              <li>
                <span className="block text-xs font-semibold text-[#F7F3EA]">
                  Phone
                </span>
                +234 XXX XXX XXXX
              </li>

              <li>
                <span className="block text-xs font-semibold text-[#F7F3EA]">
                  Email
                </span>
                hello@zaramhotels.com
              </li>

              <li>
                <span className="block text-xs font-semibold text-[#F7F3EA]">
                  Address
                </span>
                City, State, Nigeria
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
              Follow
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-[#DFE4DA]">
              <li>
                <a href="#" className="transition-colors hover:text-[#F7F3EA]">
                  Instagram
                </a>
              </li>

              <li>
                <a href="#" className="transition-colors hover:text-[#F7F3EA]">
                  Facebook
                </a>
              </li>

              <li>
                <a href="#" className="transition-colors hover:text-[#F7F3EA]">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-[#F7F3EA]/10 pt-6 text-xs text-[#DFE4DA] md:flex-row md:items-center md:justify-between">
          <p>
            © 2026 Zaram Hotels and Garden. All rights reserved.
          </p>

          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-[#F7F3EA]">
              Privacy Policy
            </a>

            <a href="#" className="transition-colors hover:text-[#F7F3EA]">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
