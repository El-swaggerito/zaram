import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Clock3,
  Camera,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import ContactForm from "@/components/contact/ContactForm";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Contact",
};

function ImagePlaceholder({
  label,
  className = "",
  dark = false,
}: {
  label: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center",
        dark ? "bg-[#174735]" : "bg-[#DDD5C8]",
        className,
      ].join(" ")}
    >
      <div className="text-center">
        <div className="mx-auto mb-3 h-px w-10 bg-[#C89D35]" />

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

const quickContact = [
  {
    title: "Call Us",
    description: "Speak directly with our team for enquiries or reservations.",
    value: "08139654033",
    href: "tel:+2348139654033",
    action: "Call Zaram",
    icon: Phone,
  },
  {
    title: "Email Us",
    description: "Send us an email and we will respond as soon as possible.",
    value: "zaramhotel10@gmail.com",
    href: "mailto:zaramhotel10@gmail.com",
    action: "Send Email",
    icon: Mail,
  },
  {
    title: "Instagram",
    description: "Follow Zaram Hotels or send us a message on Instagram.",
    value: "@zaramhotel",
    href: "https://www.instagram.com/zaramhotel",
    action: "Visit Instagram",
    icon: Camera,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-[#F7F3EA] pt-20">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0B4A32] py-24 text-white md:py-32">

        

        <div className="absolute inset-0 bg-gradient-to-t from-[#00321F] via-[#00321F]/75 to-[#00321F]/25" />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-12 sm:px-6 md:pb-16 lg:px-10">

          <div className="max-w-2xl">

            <p className="zaram-hero-reveal zaram-delay-1 text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
              Contact Zaram
            </p>

            <h1 className="zaram-hero-reveal zaram-delay-2 mt-3 font-serif text-4xl font-semibold leading-tight text-[#F7F3EA] md:text-6xl">
              We&apos;re Here to Help
            </h1>

            <p className="zaram-hero-reveal zaram-delay-3 mt-4 max-w-xl text-[15px] leading-7 text-[#DFE4DA]">
              Whether you are planning a stay, checking availability or simply
              have a question, our team is ready to assist.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT + FORM */}
      <section className="bg-[#F7F3EA] py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">

            {/* DETAILS */}
            <div className="lg:col-span-5">
              <Reveal direction="left">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#B88923]">
                    Get in Touch
                  </p>

                  <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] text-[#00321F] md:text-5xl">
                    Contact Our Team
                  </h2>

                  <p className="mt-6 max-w-md text-[15px] leading-7 text-[#404943]">
                    Reach out to Zaram Hotels and Garden for reservations,
                    enquiries or assistance with your stay.
                  </p>

                  <div className="mt-10 space-y-7">

                    <div className="flex gap-4">
                      <Phone
                        size={24}
                        strokeWidth={1.6}
                        className="mt-1 shrink-0 text-[#C89D35]"
                      />

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00321F]">
                          Phone
                        </p>

                        <a
                          href="tel:+2348139654033"
                          className="mt-1 block text-[15px] text-[#404943] transition-colors hover:text-[#B88923]"
                        >
                          08139654033
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Mail
                        size={24}
                        strokeWidth={1.6}
                        className="mt-1 shrink-0 text-[#C89D35]"
                      />

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00321F]">
                          Email
                        </p>

                        <a
                          href="mailto:zaramhotel10@gmail.com"
                          className="mt-1 block text-[15px] text-[#404943] transition-colors hover:text-[#B88923]"
                        >
                          zaramhotel10@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <MapPin
                        size={24}
                        strokeWidth={1.6}
                        className="mt-1 shrink-0 text-[#C89D35]"
                      />

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00321F]">
                          Address
                        </p>

                        <p className="mt-1 max-w-sm text-[15px] leading-7 text-[#404943]">
                          EFAB Global Estate, Road 121, House 8, Abuja
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Camera
                        size={24}
                        strokeWidth={1.6}
                        className="mt-1 shrink-0 text-[#C89D35]"
                      />

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00321F]">
                          Instagram
                        </p>

                        <a
                          href="https://www.instagram.com/zaramhotel"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 block text-[15px] text-[#404943] transition-colors hover:text-[#B88923]"
                        >
                          @zaramhotel
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Clock3
                        size={24}
                        strokeWidth={1.6}
                        className="mt-1 shrink-0 text-[#C89D35]"
                      />

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00321F]">
                          Guest Support
                        </p>

                        <p className="mt-1 text-[15px] text-[#404943]">
                          Contact us for reservation and stay enquiries.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* FORM */}
            <div className="lg:col-span-7">
              <Reveal direction="right" delay={120}>

                <div className="border border-[#0B4A32]/10 bg-[#EAE1D5] p-7 sm:p-10">

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                    Send an Enquiry
                  </p>

                  <h2 className="mt-3 font-serif text-3xl font-semibold text-[#00321F]">
                    How Can We Help?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[#404943]">
                    Complete the form below and our team will get back to you.
                  </p>

                  <a
                    href="#location"
                    className="mt-6 inline-flex h-11 items-center justify-center border border-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B4A32] transition hover:bg-[#0B4A32] hover:text-white"
                  >
                    View Location ↓
                  </a>

                  <div className="mt-8">
                    <Suspense
                      fallback={
                        <div className="h-[420px] animate-pulse bg-[#F7F3EA]" />
                      }
                    >
                      <ContactForm />
                    </Suspense>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section
        id="location"
        className="scroll-mt-24 overflow-hidden bg-[#0B4A32] py-24 text-[#F7F3EA]"
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

            <div className="lg:col-span-5">
              <Reveal direction="left">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
                    Our Location
                  </p>

                  <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] md:text-5xl">
                    Find Zaram in Abuja
                  </h2>

                  <p className="mt-6 text-[15px] leading-7 text-[#DFE4DA]">
                    Visit us at EFAB Global Estate, Road 121, House 8, Abuja.
                    Contact our team if you need help locating the hotel.
                  </p>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=EFAB+Global+Estate+Road+121+House+8+Abuja"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="zaram-button mt-8 inline-flex h-12 items-center justify-center bg-[#C89D35] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] hover:bg-[#D4A942]"
                  >
                    Get Directions
                  </a>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal direction="right" delay={120}>

                <div className="zaram-image-hover overflow-hidden border border-white/10">
                  <iframe
                    title="Zaram Hotels & Garden location"
                    src="https://www.google.com/maps?q=EFAB%20Global%20Estate%2C%20Road%20121%2C%20House%208%2C%20Abuja%2C%20Nigeria&output=embed"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block h-[420px] w-full border-0 md:h-[480px]"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CONTACT */}
      <section className="bg-[#F7F3EA] py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <Reveal direction="up">

            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#B88923]">
                Quick Contact
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] text-[#00321F] md:text-5xl">
                Choose the Easiest Way to Reach Us
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">

            {quickContact.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal
                  key={item.title}
                  direction="up"
                  delay={index * 110}
                >
                  <div className="flex h-full flex-col border border-[#0B4A32]/10 bg-[#EAE1D5] p-8">

                    <Icon
                      size={30}
                      strokeWidth={1.6}
                      className="text-[#C89D35]"
                    />

                    <h3 className="mt-6 font-serif text-2xl font-semibold text-[#00321F]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#404943]">
                      {item.description}
                    </p>

                    <p className="mt-5 text-sm font-semibold text-[#00321F]">
                      {item.value}
                    </p>

                    <a
                      href={item.href}
                      target={
                        item.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        item.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="zaram-link mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] hover:text-[#B88923]"
                    >
                      {item.action} →
                    </a>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* RESERVATION SUPPORT */}
      <section
        id="reservation"
        className="scroll-mt-24 bg-[#EAE1D5] py-24"
      >
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

            <div className="lg:col-span-7">
              <Reveal direction="left">

                <div className="zaram-image-hover">
                  <div className="aspect-[16/10] w-full overflow-hidden">
                  <img
                    src="/images/home/reception.jpeg"
                    alt="Zaram Hotels reception"
                    className="h-full w-full object-cover"
                  />
                </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal direction="right" delay={120}>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#B88923]">
                    Reservations
                  </p>

                  <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] text-[#00321F] md:text-5xl">
                    Need Help Booking Your Stay?
                  </h2>

                  <p className="mt-6 text-[15px] leading-7 text-[#404943]">
                    Contact our team directly for room availability,
                    reservation assistance or questions about your stay.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-4">

                    <a
                      href="tel:+2348139654033"
                      className="zaram-button inline-flex h-12 items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
                    >
                      Call to Book
                    </a>

                    <a
                      href="mailto:zaramhotel10@gmail.com"
                      className="zaram-button inline-flex h-12 items-center justify-center border border-[#0B4A32]/30 px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] hover:bg-[#0B4A32] hover:text-white"
                    >
                      Email Us
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#F7F3EA] pb-24 pt-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <Reveal direction="up">
            <div className="border border-[#0B4A32]/15 bg-[#EAE1D5] p-10 md:p-14">

              <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

                <div className="max-w-2xl">

                  <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#C89D35]">
                    Reservations
                  </p>

                  <h2 className="mt-2 font-serif text-4xl font-semibold text-[#0B4A32] md:text-5xl">
                    Ready for Your Stay?
                  </h2>

                  <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#404943]">
                    Reserve your room today and experience warm hospitality
                    in a peaceful environment.
                  </p>
                </div>

                <Link
                  href="/contact#reservation"
                  className="zaram-button inline-flex h-12 shrink-0 items-center justify-center bg-[#0B4A32] px-10 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
        </main>
  );
}