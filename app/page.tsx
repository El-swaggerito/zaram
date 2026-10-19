import Link from "next/link";
import {
  Wifi,
  CarFront,
  Utensils,
  ConciergeBell,
  BedDouble,
  Headphones,
} from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import HomeAvailability from "@/components/booking/HomeAvailability";

const rooms = [
  {
    name: "VIP Rooms",
    price: "₦75,250",
    description:
      "Our premium room category, offering generous space and elevated comfort. Available as Nigeria and Morocco.",
    image: "/images/rooms/nigeria.jpeg",
    alt: "Nigeria VIP Room at Zaram Hotels",
  },
  {
    name: "Big Rooms",
    price: "₦59,125",
    description:
      "Spacious rooms designed for a comfortable and relaxing stay. Available as Ghana, Kenya and Rwanda.",
    image: "/images/rooms/kenya.jpeg",
    alt: "Kenya Big Room at Zaram Hotels",
  },
  {
    name: "Medium Rooms",
    price: "₦53,750",
    description:
      "Comfortable, well-appointed rooms with everything needed for an enjoyable stay. Available as Egypt, Mozambique and Botswana.",
    image: "/images/rooms/botswana.jpeg",
    alt: "Botswana Medium Room at Zaram Hotels",
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
    <main className="bg-[#F7F3EA] pt-20">

      {/* HERO */}
      <section className="relative flex min-h-[560px] h-[calc(100vh-80px)] max-h-[820px] items-end overflow-hidden">

        <video
          autoPlay
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-100"
        >
          <source
            src="/images/home/hero-video.mp4"
            type="video/mp4"
          />
        </video>

        <div
          className="hero-after-video-overlay absolute inset-0 bg-black/20"
          aria-hidden="true"
        />


        


        <div className="hero-after-video relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-24 sm:px-6 md:pb-28 lg:px-10">
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
              A welcoming stay built around comfort, thoughtful hospitality
              and convenience.
            </p>

            <div className="zaram-hero-reveal zaram-delay-4 mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact#reservation"
                className="zaram-button inline-flex h-12 items-center justify-center bg-[#C89D35] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B4A32] hover:bg-[#D4A942]"
              >
                Book Your Stay
              </Link>

              <Link
                href="/rooms"
                className="zaram-button inline-flex h-12 items-center justify-center border border-[#F7F3EA]/60 px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] hover:bg-[#F7F3EA] hover:text-[#0B4A32]"
              >
                View Rooms
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING BAR */}
      <section className="relative z-20 bg-[#F7F3EA] pb-6">
        <div className="mx-auto -mt-10 max-w-[1160px] px-5 sm:px-6 md:-mt-12 lg:px-10">
          <Reveal direction="up" delay={100}>
            <HomeAvailability />

            <div className="mt-5 flex justify-center">
              <a
                href="/contact#location"
                className="inline-flex h-11 items-center justify-center border border-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B4A32] transition hover:bg-[#0B4A32] hover:text-white"
              >
                View Hotel Location ↓
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="bg-[#F7F3EA] py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

            <div className="lg:col-span-7">
              <Reveal direction="left">
                <div className="zaram-image-hover">
                  <div className="relative h-full min-h-[420px] overflow-hidden">
              <img
                src="/images/home/reception.jpeg"
                alt="Zaram Hotels reception and lounge"
                className="h-full w-full object-cover"
              />
            </div>
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
                    thoughtful service and a relaxed environment for both
                    short visits and longer stays.
                  </p>

                  
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED ROOMS */}
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
                className="zaram-link inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#0B4A32] hover:text-[#C89D35]"
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
                <article className="group flex h-full flex-col">

                  <div className="zaram-image-hover aspect-[4/3] overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.alt}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col pt-6">

                    <h3 className="font-serif text-2xl font-semibold text-[#0B4A32]">
                      {room.name}
                    </h3>

                    <p className="mt-2 font-serif text-lg font-semibold text-[#C89D35]">
                      From {room.price}

                      <span className="ml-1 font-sans text-sm font-normal text-[#404943]">
                        / night incl. VAT
                      </span>
                    </p>

                    <p className="mt-4 text-[15px] leading-7 text-[#404943]">
                      {room.description}
                    </p>

                    <div className="mt-6">
                      <Link
                        href="/rooms"
                        className="zaram-link inline-flex items-center gap-2 border-b border-[#0B4A32]/25 pb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B4A32] hover:text-[#C89D35]"
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

      {/* EXPERIENCE */}
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
                      href="/contact"
                      className="zaram-link border-b border-white/30 pb-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] hover:text-[#C89D35]"
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

      {/* AMENITIES */}
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
                      index > 0
                        ? "lg:border-l lg:border-[#0B4A32]/10"
                        : "",
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

      {/* FINAL CTA */}
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
