import type { Metadata } from "next";
import Link from "next/link";

import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Rooms",
};

type PlaceholderProps = {
  label: string;
  dark?: boolean;
  className?: string;
};

function ImagePlaceholder({
  label,
  dark = false,
  className = "",
}: PlaceholderProps) {
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

function AmenityIcon({
  type,
  light = false,
}: {
  type: string;
  light?: boolean;
}) {
  const colour = light ? "text-[#FFDF9D]" : "text-[#C89D35]";
  const common = `${colour} h-5 w-5 shrink-0`;

  if (type === "wifi") {
    return (
      <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M8.1 16.4a5.5 5.5 0 017.8 0M12 20h.01M4.9 13.9c3.9-3.9 10.2-3.9 14.2 0M1.4 10.3c5.8-5.8 15.3-5.8 21.2 0" />
      </svg>
    );
  }

  if (type === "air") {
    return (
      <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 3v18M12 3 9 6m3-3 3 3m-3 15-3-3m3 3 3-3M3 12h18M3 12l3-3m-3 3 3 3m15-3-3-3m3 3-3 3" />
      </svg>
    );
  }

  if (type === "bath") {
    return (
      <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 14h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3zm3-7a3 3 0 016 0v7H7V7z" />
      </svg>
    );
  }

  if (type === "tv") {
    return (
      <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 6h18v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6zm5 14h8" />
      </svg>
    );
  }

  if (type === "workspace") {
    return (
      <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9.75 17 9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }

  if (type === "living") {
    return (
      <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 9v4m-4-4v4m-6 0h16" />
      </svg>
    );
  }

  if (type === "service") {
    return (
      <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M4 18h16M7 14h10M12 6a5 5 0 015 5H7a5 5 0 015-5z" />
      </svg>
    );
  }

  return (
    <svg className={common} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M3 7v11m0-4h18m0-7v11M3 10h18M7 10V7a2 2 0 012-2h6a2 2 0 012 2v3" />
    </svg>
  );
}

const standardAmenities = [
  ["bed", "Queen or Double Bed"],
  ["wifi", "Free Wi-Fi"],
  ["air", "Air Conditioning"],
  ["bath", "Private Bathroom"],
  ["tv", "Television"],
  ["service", "Room Service"],
];

const executiveAmenities = [
  ["bed", "King or Queen Bed"],
  ["wifi", "Free Wi-Fi"],
  ["air", "Air Conditioning"],
  ["workspace", "Workspace"],
  ["bath", "Private Bathroom"],
  ["service", "Room Service"],
];

const deluxeAmenities = [
  ["bed", "King Bed"],
  ["living", "Spacious Living Area"],
  ["wifi", "Free Wi-Fi"],
  ["air", "Air Conditioning"],
  ["bath", "Private Bathroom"],
  ["service", "Room Service"],
];

function AmenityGrid({
  items,
  light = false,
}: {
  items: string[][];
  light?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-current/10 py-6">
      {items.map(([icon, label], index) => (
        <Reveal
          key={label}
          direction="up"
          delay={index * 60}
        >
          <div className="flex items-center gap-2.5">
            <AmenityIcon type={icon} light={light} />

            <span
              className={[
                "text-xs",
                light ? "text-[#F7F3EA]" : "text-[#20251F]",
              ].join(" ")}
            >
              {label}
            </span>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <main className="bg-[#F7F3EA] pt-20">

      {/* HERO */}
      <section className="relative flex h-[50vh] min-h-[420px] max-h-[580px] items-end overflow-hidden bg-[#0B4A32]">

        <ImagePlaceholder
          label="Rooms Hero Image"
          dark
          className="absolute inset-0"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#00321F] via-[#00321F]/75 to-[#00321F]/25" />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-12 sm:px-6 md:pb-16 lg:px-10">

          <div className="max-w-xl">

            <p className="zaram-hero-reveal zaram-delay-1 text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
              Rooms & Suites
            </p>

            <h1 className="zaram-hero-reveal zaram-delay-2 mt-3 font-serif text-4xl font-semibold leading-tight text-[#F7F3EA] md:text-6xl">
              Find Your Perfect Stay
            </h1>

            <p className="zaram-hero-reveal zaram-delay-3 mt-4 max-w-[560px] text-[15px] leading-7 text-[#DFE4DA]">
              Comfortable spaces designed for rest, convenience and a
              relaxing stay at Zaram Hotels and Garden.
            </p>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-[#F7F3EA] py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">

            <div className="md:col-span-6">
              <Reveal direction="left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                    Accommodations
                  </p>

                  <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#00321F] md:text-5xl">
                    Comfort Designed Around You
                  </h2>
                </div>
              </Reveal>
            </div>

            <div className="md:col-span-6 md:pt-6">
              <Reveal direction="right" delay={120}>
                <p className="text-base leading-8 text-[#404943] md:text-lg">
                  Zaram Hotels and Garden offers thoughtfully designed room
                  options tailored for individual travellers, couples, and
                  guests seeking additional space and refined convenience.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ROOM LISTINGS */}
      <section className="space-y-24 bg-[#EAE1D5] py-24">

        {/* STANDARD */}
        <div
          id="standard-room"
          className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10"
        >
          <div className="grid grid-cols-1 bg-[#F7F3EA] shadow-sm lg:grid-cols-12">

            <div className="min-h-[320px] lg:col-span-7 lg:min-h-[520px]">
              <Reveal direction="left">
                <div className="zaram-image-hover h-full">
                  <ImagePlaceholder
                    label="Standard Room Image"
                    className="min-h-[320px]"
                  />
                </div>
              </Reveal>
            </div>

            <div className="p-7 sm:p-10 lg:col-span-5">
              <Reveal direction="right" delay={120}>
                <div className="flex h-full flex-col justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                      Standard Room
                    </p>

                    <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#00321F]">
                      Simple Comfort for a Relaxing Stay
                    </h2>

                    <p className="mt-3 text-sm font-semibold text-[#00321F]">
                      From ₦35,000
                      <span className="font-normal text-[#404943]"> / night</span>
                    </p>

                    <p className="mt-6 text-[15px] leading-7 text-[#404943]">
                      A balanced, restful retreat offering thoughtful essentials,
                      plush bedding and a peaceful atmosphere designed to help
                      you recharge.
                    </p>

                    <div className="mt-6">
                      <AmenityGrid items={standardAmenities} />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-6">
                    <Link
                      href="/contact?room=standard#reservation"
                      className="zaram-button inline-flex h-12 items-center justify-center bg-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
                    >
                      Book This Room
                    </Link>

                    <a
                      href="#standard-room"
                      className="zaram-link text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] hover:text-[#B88923]"
                    >
                      View Details →
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* EXECUTIVE */}
        <div
          id="executive-room"
          className="w-full bg-[#0B4A32] py-16"
        >
          <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

            <div className="grid grid-cols-1 bg-[#0B4A32] shadow-md lg:grid-cols-12">

              <div className="order-2 p-7 sm:p-10 lg:order-1 lg:col-span-5">
                <Reveal direction="left">
                  <div className="flex h-full flex-col justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
                        Executive Room
                      </p>

                      <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#F7F3EA]">
                        More Space. More Comfort.
                      </h2>

                      <p className="mt-3 text-sm font-semibold text-[#FFDF9D]">
                        From ₦55,000
                        <span className="font-normal text-[#DFE4DA]"> / night</span>
                      </p>

                      <p className="mt-6 text-[15px] leading-7 text-[#DFE4DA]">
                        Designed for elevated convenience with additional space
                        for productivity, relaxation and an uninterrupted stay.
                      </p>

                      <div className="mt-6">
                        <AmenityGrid items={executiveAmenities} light />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-6">
                      <Link
                        href="/contact?room=executive#reservation"
                        className="zaram-button inline-flex h-12 items-center justify-center bg-[#FECE61] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] hover:bg-[#FFDF9D]"
                      >
                        Book This Room
                      </Link>

                      <a
                        href="#executive-room"
                        className="zaram-link text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] hover:text-[#FFDF9D]"
                      >
                        View Details →
                      </a>
                    </div>
                  </div>
                </Reveal>
              </div>

              <div className="order-1 min-h-[320px] lg:order-2 lg:col-span-7 lg:min-h-[520px]">
                <Reveal direction="right" delay={120}>
                  <div className="zaram-image-hover h-full">
                    <ImagePlaceholder
                      label="Executive Room Image"
                      dark
                      className="min-h-[320px]"
                    />
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>

        {/* DELUXE */}
        <div
          id="deluxe-suite"
          className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10"
        >
          <div className="grid grid-cols-1 bg-[#F7F3EA] shadow-sm lg:grid-cols-12">

            <div className="min-h-[320px] lg:col-span-7 lg:min-h-[520px]">
              <Reveal direction="left">
                <div className="zaram-image-hover h-full">
                  <ImagePlaceholder
                    label="Deluxe Suite Image"
                    className="min-h-[320px]"
                  />
                </div>
              </Reveal>
            </div>

            <div className="p-7 sm:p-10 lg:col-span-5">
              <Reveal direction="right" delay={120}>
                <div className="flex h-full flex-col justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                      Deluxe Suite
                    </p>

                    <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#00321F]">
                      A More Spacious Stay
                    </h2>

                    <p className="mt-3 text-sm font-semibold text-[#00321F]">
                      From ₦85,000
                      <span className="font-normal text-[#404943]"> / night</span>
                    </p>

                    <p className="mt-6 text-[15px] leading-7 text-[#404943]">
                      Our most spacious accommodation with a separate living
                      area and additional comfort for guests who want more room
                      to unwind.
                    </p>

                    <div className="mt-6">
                      <AmenityGrid items={deluxeAmenities} />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-6">
                    <Link
                      href="/contact?room=deluxe#reservation"
                      className="zaram-button inline-flex h-12 items-center justify-center bg-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
                    >
                      Book This Room
                    </Link>

                    <a
                      href="#deluxe-suite"
                      className="zaram-link text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] hover:text-[#B88923]"
                    >
                      View Details →
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="bg-[#F7F3EA] py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <Reveal direction="up">
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                Quick Overview
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold text-[#00321F] md:text-5xl">
                Choose the Room That Suits You
              </h2>
            </div>
          </Reveal>

          <Reveal direction="up" delay={120}>
            <div className="w-full overflow-x-auto">

              <div className="min-w-[720px]">

                <div className="grid grid-cols-4 pb-5 text-left">

                  <div className="text-xs font-semibold uppercase tracking-wider text-[#404943]">
                    Features
                  </div>

                  <div className="px-4">
                    <span className="block font-serif text-lg font-semibold text-[#00321F]">
                      Standard Room
                    </span>
                    <span className="text-xs font-medium text-[#B88923]">
                      ₦35,000 / night
                    </span>
                  </div>

                  <div className="bg-[#EAE1D5]/50 px-4 py-2">
                    <span className="block font-serif text-lg font-semibold text-[#00321F]">
                      Executive Room
                    </span>
                    <span className="text-xs font-medium text-[#B88923]">
                      ₦55,000 / night
                    </span>
                  </div>

                  <div className="px-4">
                    <span className="block font-serif text-lg font-semibold text-[#00321F]">
                      Deluxe Suite
                    </span>
                    <span className="text-xs font-medium text-[#B88923]">
                      ₦85,000 / night
                    </span>
                  </div>
                </div>

                {[
                  ["Bed Type", "Queen or Double", "King or Queen", "King Bed"],
                  ["Maximum Guests", "2 Adults", "2 Adults, 1 Child", "3 Adults or Family"],
                  ["Room Size", "28 m²", "42 m²", "65 m²"],
                  ["Wi-Fi Access", "Complimentary High-Speed", "Complimentary High-Speed", "Dedicated High-Speed"],
                  ["Air Conditioning", "Included", "Individual Climate Control", "Multi-Zone Climate Control"],
                  ["Room Service", "Standard Hours", "Extended Hours", "24/7 Priority"],
                ].map((row, index) => (
                  <Reveal
                    key={row[0]}
                    direction="up"
                    delay={index * 60}
                  >
                    <div className="grid grid-cols-4 items-center border-t border-[#E2DACD] py-4 text-sm">
                      <div className="font-semibold text-[#404943]">
                        {row[0]}
                      </div>

                      <div className="px-4 text-[#20251F]">
                        {row[1]}
                      </div>

                      <div className="self-stretch bg-[#EAE1D5]/50 px-4 py-4 text-[#20251F]">
                        {row[2]}
                      </div>

                      <div className="px-4 text-[#20251F]">
                        {row[3]}
                      </div>
                    </div>
                  </Reveal>
                ))}

                <div className="grid grid-cols-4 border-t border-[#E2DACD] py-5">

                  <div />

                  <div className="px-4">
                    <Link
                      href="/contact?room=standard#reservation"
                      className="zaram-link text-sm font-semibold text-[#00321F] hover:text-[#B88923]"
                    >
                      Book Room →
                    </Link>
                  </div>

                  <div className="bg-[#EAE1D5]/50 px-4">
                    <Link
                      href="/contact?room=executive#reservation"
                      className="zaram-link text-sm font-semibold text-[#00321F] hover:text-[#B88923]"
                    >
                      Book Room →
                    </Link>
                  </div>

                  <div className="px-4">
                    <Link
                      href="/contact?room=deluxe#reservation"
                      className="zaram-link text-sm font-semibold text-[#00321F] hover:text-[#B88923]"
                    >
                      Book Room →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#EAE1D5] py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <Reveal direction="up">
            <div className="flex flex-col items-start justify-between gap-8 bg-[#F7F3EA] p-8 shadow-sm sm:p-12 md:flex-row md:items-center">

              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                  Reservations
                </p>

                <h2 className="mt-3 font-serif text-3xl font-semibold text-[#00321F]">
                  Found the Right Room?
                </h2>

                <p className="mt-4 text-[15px] leading-7 text-[#404943]">
                  Reserve your stay today and experience warm hospitality in
                  a peaceful environment.
                </p>
              </div>

              <Link
                href="/contact#reservation"
                className="zaram-button inline-flex h-12 w-full items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038] sm:w-auto"
              >
                Book Your Stay
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
