import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import {
  Wifi,
  CarFront,
  Utensils,
  ConciergeBell,
  BedDouble,
  Headphones,
} from "lucide-react";

const rooms = [
  {
    name: "Standard Room",
    price: "₦35,000",
    description:
      "A comfortable room with everything you need for a relaxed stay.",
    placeholder: "Standard Room Image",
  },
  {
    name: "Executive Room",
    price: "₦55,000",
    description:
      "A spacious retreat with added room for work, rest and relaxation.",
    placeholder: "Executive Room Image",
  },
  {
    name: "Deluxe Suite",
    price: "₦85,000",
    description:
      "A more spacious stay with additional comfort and living space.",
    placeholder: "Deluxe Suite Image",
  },
];

const amenities = [
  {
    name: "Free Wi-Fi",
    detail: "High-speed access",
    icon: Wifi,
  },
  {
    name: "Secure Parking",
    detail: "Convenient parking",
    icon: CarFront,
  },
  {
    name: "Restaurant",
    detail: "Fresh daily dining",
    icon: Utensils,
  },
  {
    name: "Room Service",
    detail: "Delivered to your room",
    icon: ConciergeBell,
  },
  {
    name: "Comfort Rooms",
    detail: "Relaxing accommodation",
    icon: BedDouble,
  },
  {
    name: "Guest Support",
    detail: "Helpful assistance",
    icon: Headphones,
  },
];

function ImagePlaceholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center bg-[#DDD5C8]",
        "border border-[#0B4A32]/10",
        className,
      ].join(" ")}
    >
      <div className="text-center">
        <div className="mx-auto mb-3 h-px w-10 bg-[#C89D35]" />

        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B4A32]/50">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      

      <main className="bg-[#F7F3EA] pt-20">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="relative flex min-h-[560px] h-[calc(100vh-80px)] max-h-[820px] items-end overflow-hidden bg-[#0B4A32]">

          <ImagePlaceholder
            label="Hero Hotel Image"
            className="absolute inset-0 h-full w-full border-0 bg-[#244A3A]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B4A32] via-[#0B4A32]/80 to-[#20251F]/30" />

          <div className="absolute inset-0 bg-gradient-to-r from-[#0B4A32]/85 via-[#0B4A32]/30 to-transparent" />

          <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-24 sm:px-6 md:pb-28 lg:px-10">

            <div className="max-w-xl">

              <p className="zaram-hero-reveal zaram-delay-1 text-xs font-semibold uppercase tracking-[0.20em] text-[#C89D35]">
                Welcome to Zaram
              </p>

              <h1 className="zaram-hero-reveal zaram-delay-2 mt-4 font-serif text-5xl font-semibold leading-[0.98] tracking-tight text-[#F7F3EA] sm:text-6xl lg:text-[64px]">
                Stay Comfortable.
                <br />
                Stay Zaram.
              </h1>

              <p className="zaram-hero-reveal zaram-delay-3 mt-6 max-w-lg text-base leading-7 text-[#F7F3EA]/85 sm:text-lg">
                A welcoming stay built around comfort, thoughtful
                hospitality and convenience.
              </p>

              <div className="zaram-hero-reveal zaram-delay-4 mt-8 flex flex-wrap gap-4">

                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center bg-[#C89D35] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B4A32] transition-colors hover:bg-[#D4A942]"
                >
                  Book Your Stay
                </Link>

                <Link
                  href="/rooms"
                  className="inline-flex h-12 items-center justify-center border border-[#F7F3EA]/60 px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] transition-colors hover:bg-[#F7F3EA] hover:text-[#0B4A32]"
                >
                  View Rooms
                </Link>
                  </div>
                </Reveal>
              </div>
            </div>
            </Reveal>
          </div>
        </section>

        {/* =====================================================
            BOOKING BAR
        ====================================================== */}

        <section className="relative z-20 bg-[#F7F3EA] pb-6">

          <div className="mx-auto -mt-10 max-w-[1160px] px-5 sm:px-6 md:-mt-12 lg:px-10">

            <Reveal direction="up" delay={100}>
              <form className="grid grid-cols-1 border border-[#0B4A32]/15 bg-[#F7F3EA] p-2 shadow-[0_8px_30px_rgba(11,74,50,0.12)] md:grid-cols-4 md:p-3">

              <label className="border-b border-[#0B4A32]/15 px-6 py-4 md:border-b-0 md:border-r">

                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B4A32]/65">
                  Check-In
                </span>

                <input
                  type="date"
                  className="mt-1 w-full bg-transparent text-sm text-[#20251F] outline-none"
                />
              </label>

              <label className="border-b border-[#0B4A32]/15 px-6 py-4 md:border-b-0 md:border-r">

                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B4A32]/65">
                  Check-Out
                </span>

                <input
                  type="date"
                  className="mt-1 w-full bg-transparent text-sm text-[#20251F] outline-none"
                />
              </label>

              <label className="border-b border-[#0B4A32]/15 px-6 py-4 md:border-b-0 md:border-r">

                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0B4A32]/65">
                  Guests
                </span>

                <select
                  defaultValue="2"
                  className="mt-1 w-full bg-transparent text-sm text-[#20251F] outline-none"
                >
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">2 Adults, 2 Children</option>
                </select>
              </label>

              <div className="flex items-center p-2 md:pl-4">

                <button
                  type="submit"
                  className="flex min-h-12 w-full items-center justify-center bg-[#0B4A32] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] transition-colors hover:bg-[#145038] md:h-full"
                >
                  Check Availability →
                </button>
              </div>
            </form>
            </Reveal>
          </div>
        </section>

        {/* =====================================================
            INTRODUCTION
        ====================================================== */}

        <section className="bg-[#F7F3EA] py-24">

          <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

              <div className="lg:col-span-7">

                <Reveal direction="left">
                  <div className="zaram-image-hover">
                    <ImagePlaceholder
                  label="Hotel Introduction Image"
                  className="aspect-[16/11] w-full"
                    />
                  </div>
                </Reveal>
              </div>

              <div className="lg:col-span-5 lg:pl-4">

                <Reveal direction="right" delay={120}>
                  <div>
                <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#C89D35]">
                  Welcome
                </p>

                <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] text-[#0B4A32] md:text-5xl">
                  A Place to Rest, Recharge and Feel at Home
                </h2>

                <p className="mt-6 text-[15px] leading-7 text-[#404943]">
                  Zaram Hotels and Garden offers comfortable accommodation,
                  thoughtful service and a relaxed environment for both short
                  visits and longer stays.
                </p>

                <Link
                  href="/about"
                  className="mt-8 inline-flex items-center gap-2 border-b border-[#0B4A32]/30 pb-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#0B4A32] transition-colors hover:text-[#C89D35]"
                >
                  About Zaram →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEATURED ROOMS
        ====================================================== */}

        <section className="bg-[#EAE1D5] py-24">

          <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

            <Reveal direction="up">
              <div className="flex flex-col gap-6 border-b border-[#0B4A32]/10 pb-12 md:flex-row md:items-end md:justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#C89D35]">
                  Our Rooms
                </p>

                <h2 className="mt-2 font-serif text-4xl font-semibold text-[#0B4A32] md:text-5xl">
                  Rooms Designed Around Comfort
                </h2>

                <p className="mt-3 text-[15px] text-[#404943]">
                  Simple, comfortable spaces for a relaxing stay.
                </p>
              </div>

              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#0B4A32] transition-colors hover:text-[#C89D35]"
              >
                View All Rooms →
              </Link>
            </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-10 pt-12 md:grid-cols-3 md:gap-8">

              {rooms.map((room, index) => (
                <Reveal
                  key={room.name}
                  direction="up"
                  delay={index * 120}
                >
                <article className="group flex flex-col">

                  <div className="overflow-hidden">
                    <ImagePlaceholder
                      label={room.placeholder}
                      className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col pt-6">

                    <h3 className="font-serif text-2xl font-semibold text-[#0B4A32]">
                      {room.name}
                    </h3>

                    <p className="mt-2 font-serif text-lg font-semibold text-[#C89D35]">
                      From {room.price}
                      <span className="ml-1 font-sans text-sm font-normal text-[#404943]">
                        / night
                      </span>
                    </p>

                    <p className="mt-4 text-[15px] leading-7 text-[#404943]">
                      {room.description}
                    </p>

                    <div className="mt-6">

                      <Link
                        href="/rooms"
                        className="inline-flex items-center gap-2 border-b border-[#0B4A32]/25 pb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B4A32] transition-colors hover:text-[#C89D35]"
                      >
                        View Room →
                      </Link>
                    </div>
                  </div>
                </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            ZARAM EXPERIENCE
        ====================================================== */}

        <section className="overflow-hidden bg-[#0B4A32] py-24 text-[#F7F3EA]">

          <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

              <div className="order-2 lg:order-1 lg:col-span-5">

                <Reveal direction="left">
                  <div>
                <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#C89D35]">
                  The Zaram Experience
                </p>

                <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] text-[#F7F3EA] md:text-5xl">
                  Comfort Beyond the Room
                </h2>

                <p className="mt-6 text-[15px] leading-7 text-[#F7F3EA]/80">
                  Enjoy a welcoming environment with convenient amenities,
                  thoughtful service and spaces designed to make your stay
                  feel easy and relaxed.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-6">

                  <Link
                    href="/about"
                    className="inline-flex h-12 items-center justify-center bg-[#C89D35] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B4A32] hover:bg-[#D4A942]"
                  >
                    Discover Zaram
                  </Link>

                  <Link
                    href="/contact"
                    className="border-b border-white/30 pb-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] hover:text-[#C89D35]"
                  >
                    Contact Us →
                  </Link>
                </div>
                  </div>
                </Reveal>
              </div>

              <div className="order-1 lg:order-2 lg:col-span-7">

                <Reveal direction="right" delay={120}>
                  <div className="zaram-image-hover">
                    <ImagePlaceholder
                  label="Zaram Experience Image"
                  className="aspect-[16/11] w-full bg-[#163D2E] text-white"
                    />
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            AMENITIES
        ====================================================== */}

        <section className="bg-[#F7F3EA] py-24">

          <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

            <Reveal direction="up">
            <div className="mx-auto max-w-2xl text-center">

              <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#C89D35]">
                Amenities
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] text-[#0B4A32] md:text-5xl">
                Everything You Need for a Comfortable Stay
              </h2>
            </div>
            </Reveal>

            <div className="mt-16 grid grid-cols-2 gap-y-10 md:grid-cols-3 lg:grid-cols-6">

              {amenities.map((amenity, index) => {
                const Icon = amenity.icon;

                return (
                  <Reveal
                    key={amenity.name}
                    direction="up"
                    delay={index * 80}
                  >
                  <div
                    className={[
                      "flex flex-col items-center px-4 text-center",
                      index > 0 ? "lg:border-l lg:border-[#0B4A32]/10" : "",
                    ].join(" ")}
                  >
                    <div className="mb-5 flex h-12 w-12 items-center justify-center text-[#C89D35]">
                      <Icon
                        size={30}
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-[#0B4A32]">
                      {amenity.name}
                    </h3>

                    <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.10em] text-[#404943]/65">
                      {amenity.detail}
                    </p>
                  </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ====================================================== */}

        <section className="bg-[#F7F3EA] pb-24">

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
                  href="/contact"
                  className="inline-flex h-12 shrink-0 items-center justify-center bg-[#0B4A32] px-10 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] hover:bg-[#145038]"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      
    </>
  );
}
