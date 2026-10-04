import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
};

function ImagePlaceholder({
  label,
  dark = false,
  className = "",
}: {
  label: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex h-full w-full items-center justify-center",
        dark ? "bg-[#174735]" : "bg-[#DDD5C8]",
        className,
      ].join(" ")}
    >
      <div className="text-center">
        <div className="mx-auto mb-3 h-px w-12 bg-[#C89D35]" />

        <span
          className={[
            "text-xs font-semibold uppercase tracking-[0.16em]",
            dark ? "text-[#F7F3EA]/65" : "text-[#0B4A32]/50",
          ].join(" ")}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

const quickContacts = [
  {
    title: "Call Us",
    description:
      "Immediate assistance from our front desk and reservation team.",
    value: "08139654033",
    href: "tel:2348139654033",
    action: "Call Now",
    icon: Phone,
  },
  {
    title: "Email Us",
    description:
      "Send us your room, reservation or general hotel enquiry.",
    value: "zaramhotel10@gmail.com",
    href: "mailto:zaramhotel10@gmail.com",
    action: "Send Email",
    icon: Mail,
  },
  {
    title: "Instagram",
    description:
      "Follow Zaram Hotels and send us a message through Instagram.",
    value: "@zaramhotel",
    href: "https://www.instagram.com/zaramhotel",
    action: "Visit Instagram",
    icon: MessageCircle,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-[#F7F3EA] pt-20">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative flex h-[471px] min-h-[380px] max-h-[500px] items-end overflow-hidden bg-[#0B4A32]">

        <ImagePlaceholder
          label="Contact Hero Image"
          dark
          className="absolute inset-0"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0B4A32] via-[#0B4A32]/75 to-[#0B4A32]/40" />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-12 sm:px-6 md:pb-16 lg:px-10">

          <div className="max-w-2xl">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
              Contact
            </p>

            <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight text-[#F7F3EA] md:text-6xl">
              We’re Here to Help
            </h1>

            <p className="mt-4 max-w-xl text-lg font-light leading-7 text-[#F7F3EA]/90">
              Get in touch with Zaram Hotels and Garden for reservations,
              enquiries or assistance with your stay.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT + FORM
      ====================================================== */}

      <section className="bg-[#F7F3EA] py-20 md:py-24">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">

            {/* Left */}
            <div className="lg:col-span-5">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                Get In Touch
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#00321F] md:text-5xl">
                Let’s Make Your Stay Easy
              </h2>

              <p className="mt-6 text-[15px] leading-7 text-[#404943]">
                Whether you are planning a future stay, enquiring about our
                rooms or need assistance with a reservation, our team is
                ready to help.
              </p>

              <div className="mt-10">

                {/* Phone */}
                <div className="flex items-start gap-4 py-6">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#EBEFE6] text-[#00321F]">
                    <Phone size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                      Phone
                    </p>

                    <a
                      href="tel:2348139654033"
                      className="mt-1 block font-serif text-lg font-semibold text-[#20251F] transition-colors hover:text-[#0B4A32]"
                    >
                      08139654033
                    </a>

                    <p className="mt-1 text-sm text-[#404943]">
                      Guest and reservation assistance
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 bg-[#F1F5EB] px-4 py-6">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#EBEFE6] text-[#00321F]">
                    <Mail size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                      Email
                    </p>

                    <a
                      href="mailto:zaramhotel10@gmail.com"
                      className="mt-1 block font-serif text-lg font-semibold text-[#20251F] transition-colors hover:text-[#0B4A32]"
                    >
                      zaramhotel10@gmail.com
                    </a>

                    <p className="mt-1 text-sm text-[#404943]">
                      General enquiries and information
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 py-6">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#EBEFE6] text-[#00321F]">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                      Address
                    </p>

                    <p className="mt-1 font-serif text-lg font-semibold text-[#20251F]">
                      Zaram Hotels and Garden
                    </p>

                    <p className="mt-1 text-sm text-[#404943]">
                      EFAB Global Estate, Road 121, House 8, Abuja
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="lg:col-span-7">

              <Suspense
                fallback={
                  <div className="min-h-[520px] bg-[#F1F5EB]" />
                }
              >
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LOCATION
      ====================================================== */}

      <section className="bg-[#0B4A32] py-24 text-[#F7F3EA]">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

            <div className="h-[420px] overflow-hidden lg:col-span-7">

              <ImagePlaceholder
                label="Map / Hotel Location"
                dark
                className="h-full"
              />
            </div>

            <div className="lg:col-span-5">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
                Find Us
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight md:text-5xl">
                Visit Zaram Hotels and Garden
              </h2>

              <p className="mt-5 text-lg leading-8 text-[#F7F3EA]/85">
                EFAB Global Estate, Road 121, House 8, Abuja
              </p>

              <div className="mt-7 space-y-4 bg-[#004B2F]/50 px-5 py-5">

                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-[#FFDF9D]" />
                  <span className="text-sm text-[#F7F3EA]/90">
                    08139654033
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-[#FFDF9D]" />
                  <span className="text-sm text-[#F7F3EA]/90">
                    zaramhotel10@gmail.com
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock3 size={18} className="text-[#FFDF9D]" />
                  <span className="text-sm text-[#F7F3EA]/90">
                    Guest support available daily
                  </span>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-6">

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center bg-[#C89D35] px-7 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] transition-colors hover:bg-[#FFDF9D]"
                >
                  Get Directions
                </a>

                <a
                  href="tel:2348139654033"
                  className="border-b border-[#F7F3EA]/40 pb-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] transition-colors hover:text-[#FFDF9D]"
                >
                  Call Hotel →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK CONTACT
      ====================================================== */}

      <section className="bg-[#EBEFE6] py-24">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="max-w-2xl">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
              Quick Contact
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#00321F] md:text-5xl">
              Choose the Easiest Way to Reach Us
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">

            {quickContacts.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex flex-col justify-between bg-[#F7F3EA] p-7 shadow-sm"
                >
                  <div>

                    <div className="flex h-12 w-12 items-center justify-center bg-[#E5EAE0] text-[#00321F]">
                      <Icon size={25} strokeWidth={1.6} />
                    </div>

                    <h3 className="mt-5 font-serif text-2xl font-semibold text-[#00321F]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#404943]">
                      {item.description}
                    </p>

                    <p className="mt-5 font-serif text-lg font-semibold text-[#20251F]">
                      {item.value}
                    </p>
                  </div>

                  <a
                    href={item.href}
                    target={item.title === "WhatsApp" ? "_blank" : undefined}
                    rel={item.title === "WhatsApp" ? "noopener noreferrer" : undefined}
                    className="mt-6 inline-flex items-center gap-2 border-b border-[#C89D35] pb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] transition-colors hover:text-[#B88923]"
                  >
                    {item.action} →
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          RESERVATION SUPPORT
      ====================================================== */}

      <section className="bg-[#DFE4DA] py-16">

        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">

          <div className="max-w-2xl">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
              Concierge Booking
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold text-[#00321F]">
              Planning Your Stay?
            </h2>

            <p className="mt-4 text-[15px] leading-7 text-[#404943]">
              Reach out directly if you need help selecting a room or
              arranging your stay.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">

            <a
              href="#reservation"
              className="inline-flex h-12 items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] transition-colors hover:bg-[#145038]"
            >
              Book Now
            </a>

            <Link
              href="/rooms"
              className="inline-flex h-12 items-center justify-center bg-[#F7F3EA] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] transition-colors hover:bg-white"
            >
              View Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="bg-[#0B4A32] py-24 text-[#F7F3EA]">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="flex flex-col gap-8 bg-[#004B2F]/60 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-xl">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
                Need Assistance?
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">
                Speak With Our Team
              </h2>

              <p className="mt-4 text-[15px] leading-7 text-[#F7F3EA]/85">
                We’re available to help with your booking and hotel enquiries.
              </p>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <a
                href="tel:2348139654033"
                className="inline-flex h-12 items-center justify-center bg-[#C89D35] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] transition-colors hover:bg-[#FFDF9D]"
              >
                Contact Us
              </a>

              <a
                href="#reservation"
                className="border-b border-[#F7F3EA]/40 pb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] transition-colors hover:text-[#FFDF9D]"
              >
                Book Your Stay →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
