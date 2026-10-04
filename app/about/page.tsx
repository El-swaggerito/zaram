import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  BedDouble,
  ConciergeBell,
  Headphones,
  MapPin,
  Star,
  Trees,
} from "lucide-react";

import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About",
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

const values = [
  {
    title: "Comfort",
    text: "Thoughtful rooms and welcoming spaces designed to help every guest feel at ease.",
    icon: BedDouble,
  },
  {
    title: "Hospitality",
    text: "Warm, attentive service focused on making each stay simple and enjoyable.",
    icon: ConciergeBell,
  },
  {
    title: "Quality",
    text: "A consistent standard of care across our rooms, service and guest experience.",
    icon: Star,
  },
];

const reasons = [
  {
    title: "Comfortable Rooms",
    text: "Restful accommodation designed around practical comfort.",
    icon: BedDouble,
  },
  {
    title: "Convenient Location",
    text: "A practical Abuja location for leisure and business stays.",
    icon: MapPin,
  },
  {
    title: "Helpful Guest Support",
    text: "Friendly assistance whenever you need it.",
    icon: Headphones,
  },
  {
    title: "Relaxed Environment",
    text: "A calm setting where guests can unwind and feel at home.",
    icon: Trees,
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#F7F3EA] pt-20">

      {/* HERO */}
      <section className="relative flex h-[52vh] min-h-[430px] max-h-[620px] items-end overflow-hidden bg-[#0B4A32]">

        <ImagePlaceholder
          label="About Hero Image"
          dark
          className="absolute inset-0 h-full w-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#00321F] via-[#00321F]/75 to-[#00321F]/25" />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-14 sm:px-6 md:pb-16 lg:px-10">
          <div className="max-w-2xl">

            <p className="zaram-hero-reveal zaram-delay-1 text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
              About Zaram
            </p>

            <h1 className="zaram-hero-reveal zaram-delay-2 mt-3 font-serif text-4xl font-semibold leading-tight text-[#F7F3EA] md:text-6xl">
              Hospitality Made Simple
            </h1>

            <p className="zaram-hero-reveal zaram-delay-3 mt-4 max-w-xl text-[15px] leading-7 text-[#DFE4DA]">
              A welcoming hotel experience built around comfort, thoughtful
              service and a relaxed atmosphere.
            </p>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="bg-[#F7F3EA] py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

            <div className="lg:col-span-6">
              <Reveal direction="left">
                <div className="zaram-image-hover">
                  <ImagePlaceholder
                    label="Our Story Image"
                    className="aspect-[4/3] w-full"
                  />
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-6">
              <Reveal direction="right" delay={120}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#B88923]">
                    Our Story
                  </p>

                  <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] text-[#00321F] md:text-5xl">
                    A Stay Designed to Feel Effortless
                  </h2>

                  <p className="mt-6 text-[15px] leading-7 text-[#404943]">
                    Zaram Hotels and Garden was created to offer guests a
                    comfortable, welcoming place to stay in Abuja. Our focus is
                    simple: provide clean, relaxing rooms, helpful service and
                    an environment where guests can settle in with ease.
                  </p>

                  <p className="mt-5 text-[15px] leading-7 text-[#404943]">
                    Whether you are visiting for work, a short break or a longer
                    stay, our goal is to make your experience straightforward,
                    comfortable and memorable.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-[#0B4A32] py-24 text-[#F7F3EA]">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <Reveal direction="up">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
                What Matters to Us
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">
                The Values Behind Every Stay
              </h2>
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {values.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal
                  key={item.title}
                  direction="up"
                  delay={index * 120}
                >
                  <div className="border border-[#F7F3EA]/10 p-8">
                    <Icon
                      size={30}
                      strokeWidth={1.6}
                      className="text-[#FFDF9D]"
                    />

                    <h3 className="mt-6 font-serif text-2xl font-semibold">
                      {item.title}
                    </h3>

                    <p className="mt-4 text-[15px] leading-7 text-[#DFE4DA]">
                      {item.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="bg-[#EAE1D5] py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

            <div className="lg:col-span-5">
              <Reveal direction="left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#B88923]">
                    The Zaram Experience
                  </p>

                  <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] text-[#00321F] md:text-5xl">
                    More Than Just a Room
                  </h2>

                  <p className="mt-6 text-[15px] leading-7 text-[#404943]">
                    From the moment you arrive, our focus is on making your stay
                    easy. Comfortable spaces, attentive service and useful
                    amenities come together to create a simple and enjoyable
                    hotel experience.
                  </p>

                  <Link
                    href="/rooms"
                    className="zaram-button mt-8 inline-flex h-12 items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
                  >
                    Explore Our Rooms
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal direction="right" delay={120}>
                <div className="zaram-image-hover">
                  <ImagePlaceholder
                    label="Zaram Experience Image"
                    className="aspect-[16/11] w-full"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section className="bg-[#F7F3EA] py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">

            <div className="lg:col-span-5">
              <Reveal direction="left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#B88923]">
                    Our Approach
                  </p>

                  <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] text-[#00321F] md:text-5xl">
                    Thoughtful Hospitality, Every Day
                  </h2>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal direction="right" delay={120}>
                <div className="space-y-8">
                  {[
                    "Maintain clean, comfortable and well-prepared rooms.",
                    "Provide helpful service with a warm and respectful approach.",
                    "Create a calm environment where guests can relax.",
                    "Keep the guest experience simple, reliable and convenient.",
                  ].map((item, index) => (
                    <Reveal
                      key={item}
                      direction="up"
                      delay={index * 80}
                    >
                      <div className="flex gap-4 border-b border-[#0B4A32]/10 pb-6">
                        <BadgeCheck
                          size={24}
                          strokeWidth={1.6}
                          className="mt-0.5 shrink-0 text-[#C89D35]"
                        />

                        <p className="text-[15px] leading-7 text-[#404943]">
                          {item}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ZARAM */}
      <section className="bg-[#EAE1D5] py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <Reveal direction="up">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#B88923]">
                Why Zaram
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.08] text-[#00321F] md:text-5xl">
                A Stay Built Around What Matters
              </h2>
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-px bg-[#0B4A32]/10 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal
                  key={item.title}
                  direction="up"
                  delay={index * 90}
                >
                  <div className="h-full bg-[#F7F3EA] p-8">
                    <Icon
                      size={30}
                      strokeWidth={1.6}
                      className="text-[#C89D35]"
                    />

                    <h3 className="mt-6 font-serif text-xl font-semibold text-[#00321F]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[#404943]">
                      {item.text}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0B4A32] py-20 text-[#F7F3EA]">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <Reveal direction="up">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
                  Plan Your Stay
                </p>

                <h2 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">
                  Experience Zaram for Yourself
                </h2>

                <p className="mt-4 text-[15px] leading-7 text-[#DFE4DA]">
                  Explore our rooms or get in touch with our team to plan your
                  stay.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/rooms"
                  className="zaram-button inline-flex h-12 items-center justify-center bg-[#C89D35] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] hover:bg-[#D4A942]"
                >
                  View Rooms
                </Link>

                <Link
                  href="/contact#reservation"
                  className="zaram-button inline-flex h-12 items-center justify-center border border-[#F7F3EA]/40 px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#F7F3EA] hover:text-[#00321F]"
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
