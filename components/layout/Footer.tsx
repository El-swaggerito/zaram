import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0B4A32] text-[#F7F3EA]">
      <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-6 lg:px-10 lg:py-20">

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* Brand */}
          <div>
            <p className="font-serif text-xl font-semibold">
              Zaram Hotels
            </p>

            <p className="mt-5 max-w-xs text-sm leading-6 text-[#F7F3EA]/65">
              Comfortable accommodation, thoughtful hospitality and a
              peaceful environment for a relaxing stay.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C89D35]">
              Navigate
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-[#F7F3EA]/70">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/rooms" className="hover:text-white">
                  Rooms
                </Link>
              </li>

              <li>
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>

              <li>
                <Link href="/contact" className="hover:text-white">
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C89D35]">
              Contact
            </h3>

            <div className="mt-5 space-y-4 text-sm text-[#F7F3EA]/70">

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#F7F3EA]">
                  Phone
                </span>

                <span>+234 XXX XXX XXXX</span>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#F7F3EA]">
                  Email
                </span>

                <span>hello@zaramhotels.com</span>
              </div>

              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#F7F3EA]">
                  Address
                </span>

                <span>City, State, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C89D35]">
              Follow
            </h3>

            <ul className="mt-5 space-y-3 text-sm text-[#F7F3EA]/70">
              <li>
                <a href="#" className="hover:text-white">
                  Instagram
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-white">
                  Facebook
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-white">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-[#F7F3EA]/55 md:flex-row md:items-center md:justify-between">

          <p>
            © 2026 Zaram Hotels and Garden. All rights reserved.
          </p>

          <div className="flex gap-6">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
