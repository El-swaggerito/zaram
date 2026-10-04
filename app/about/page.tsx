import type { Metadata } from "next";
import Link from "next/link";
import {
  BedDouble,
  ConciergeBell,
  Star,
  BadgeCheck,
  MapPin,
  Headphones,
  Trees,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
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

const values = [
  {
    title: "Comfort",
    description: "Spaces designed to help guests relax and feel at ease.",
    icon: BedDouble,
  },
  {
    title: "Hospitality",
    description: "Warm, attentive service that makes every stay feel welcoming.",
    icon: ConciergeBell,
  },
  {
    title: "Convenience",
    description: "Practical amenities and thoughtful details that make travelling easier.",
    icon: Star,
  },
];

const benefits = [
  {
    title: "Comfortable Rooms",
    description: "Thoughtfully furnished rooms designed for deep rest.",
    icon: BedDouble,
  },
  {
    title: "Convenient Location",
    description: "Easy access while maintaining a calm and relaxed atmosphere.",
    icon: MapPin,
  },
  {
    title: "Helpful Guest Support",
    description: "Attentive support whenever you need assistance.",
    icon: Headphones,
  },
  {
    title: "Relaxed Environment",
    description: "Quiet surroundings and comfortable spaces to unwind.",
    icon: Trees,
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#F7F3EA] pt-20">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative flex h-[512px] min-h-[420px] max-h-[520px] items-end overflow-hidden bg-[#0B4A32]">

        <ImagePlaceholder
          label="About Hero Image"
          dark
          className="absolute inset-0"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0B4A32]/95 via-[#0B4A32]/65 to-[#0B4A32]/30" />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-16 sm:px-6 lg:px-10">

          <div className="max-w-[520px]">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
              About Zaram
            </p>

            <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight tracking-tight text-[#F7F3EA] md:text-6xl">
              Hospitality Made Simple
            </h1>

            <p className="mt-4 text-lg font-light leading-7 text-[#DFE4DA]">
              A comfortable place to stay, unwind and feel welcome.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          OUR STORY
      ====================================================== */}

      <section className="bg-[#F7F3EA] py-24">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

            <div className="lg:col-span-7">

              <div className="aspect-[4/3] overflow-hidden border border-[#0B4A32]/15 shadow-sm">

                <ImagePlaceholder
                  label="Our Story Image"
                  className="h-full w-full"
                />
              </div>
            </div>

            <div className="lg:col-span-5 lg:pl-4">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                Our Story
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#0B4A32] md:text-5xl">
                A Welcoming Stay, Thoughtfully Created
              </h2>

              <div className="mt-6 space-y-4 text-[15px] leading-7 text-[#404943]">

                <p>
                  Zaram Hotels and Garden is focused on providing comfortable
                  accommodation, warm hospitality and a relaxed guest
                  experience designed around ease and tranquillity.
                </p>

                <p>
                  Whether you are visiting for business, leisure or an
                  extended stay, we offer a calm environment with thoughtful
                  service and comfortable living spaces.
                </p>
              </div>

              <Link
                href="/rooms"
                className="mt-8 inline-flex items-center gap-2 border-b border-[#C89D35] pb-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#0B4A32] transition-colors hover:text-[#B88923]"
              >
                Explore Our Rooms →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUES
      ====================================================== */}

      <section className="bg-[#0B4A32] py-24 text-[#F7F3EA]">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="max-w-2xl">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
              What Matters to Us
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight md:text-5xl">
              Comfort, Care and Consistency
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">

            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className={[
                    "space-y-5 pb-8 md:pb-0",
                    index < values.length - 1
                      ? "md:border-r md:border-[#F7F3EA]/15 md:pr-8"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex h-12 w-12 items-center justify-center text-[#FFDF9D]">
                    <Icon size={32} strokeWidth={1.5} />
                  </div>

                  <div>
                    <h3 className="font-serif text-3xl font-semibold">
                      {value.title}
                    </h3>

                    <p className="mt-3 max-w-sm text-[15px] leading-7 text-[#DFE4DA]">
                      {value.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          ZARAM EXPERIENCE
      ====================================================== */}

      <section className="bg-[#F7F3EA] py-24">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

            <div className="lg:col-span-5">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                The Zaram Experience
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#0B4A32] md:text-5xl">
                More Than Just a Place to Sleep
              </h2>

              <p className="mt-6 text-[15px] leading-7 text-[#404943]">
                Zaram aims to provide a calm environment where guests can
                rest, dine and enjoy a comfortable stay with effortless peace
                of mind.
              </p>

              <ul className="my-7 space-y-4 border-y border-[#0B4A32]/10 py-5">

                {[
                  "Comfortable accommodation",
                  "Welcoming service",
                  "Convenient amenities",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-semibold text-[#0B4A32]"
                  >
                    <span className="h-1.5 w-1.5 bg-[#C89D35]" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/rooms"
                className="inline-flex items-center gap-2 border-b border-[#C89D35] pb-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#0B4A32] transition-colors hover:text-[#B88923]"
              >
                View Our Rooms →
              </Link>
            </div>

            <div className="lg:col-span-7">

              <div className="aspect-[4/3] overflow-hidden border border-[#0B4A32]/15 shadow-sm">

                <ImagePlaceholder
                  label="Zaram Experience Image"
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          OUR APPROACH
      ====================================================== */}

      <section className="border-t border-[#0B4A32]/10 bg-[#EAE1D5] py-24">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">

            <div className="lg:col-span-7">

              <div className="aspect-[4/3] overflow-hidden border border-[#0B4A32]/15 shadow-sm">

                <ImagePlaceholder
                  label="Hospitality Image"
                  className="h-full w-full"
                />
              </div>
            </div>

            <div className="lg:col-span-5 lg:pl-4">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                Our Approach
              </p>

              <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#0B4A32] md:text-5xl">
                Warm Hospitality, Every Day
              </h2>

              <p className="mt-6 text-[15px] leading-7 text-[#404943]">
                We believe genuine hospitality begins with attentive care and
                respect. From the moment you arrive, our team is committed to
                making your stay restful, seamless and welcoming.
              </p>

              <div className="mt-6 flex items-center gap-3 text-sm text-[#404943]">

                <BadgeCheck
                  size={20}
                  strokeWidth={1.6}
                  className="text-[#C89D35]"
                />

                <span>
                  Dedicated daily housekeeping and personalised guest assistance
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHY ZARAM
      ====================================================== */}

      <section className="bg-[#F7F3EA] py-24">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="max-w-2xl">

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
              Why Zaram
            </p>

            <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#0B4A32] md:text-5xl">
              A Stay Designed Around What Matters
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="border border-[#0B4A32]/10 bg-white p-6 transition-colors hover:border-[#C89D35]"
                >
                  <div className="flex h-10 w-10 items-center justify-center text-[#0B4A32]">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>

                  <h3 className="mt-5 font-serif text-xl font-semibold text-[#0B4A32]">
                    {benefit.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#404943]">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="bg-[#F7F3EA] pb-24">

        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="border border-[#FFDF9D]/20 bg-[#0B4A32] p-8 text-[#F7F3EA] shadow-md sm:p-12">

            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">

              <div className="lg:col-span-7">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FFDF9D]">
                  Your Stay
                </p>

                <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight md:text-5xl">
                  Come and Experience Zaram
                </h2>

                <p className="mt-4 max-w-lg text-[15px] leading-7 text-[#DFE4DA]">
                  Discover comfortable rooms and warm hospitality for your
                  next stay.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row lg:col-span-5 lg:justify-end">

                <Link
                  href="/contact#reservation"
                  className="inline-flex h-12 items-center justify-center bg-[#FFDF9D] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-[#0B4A32] transition-colors hover:bg-[#EFC055]"
                >
                  Book Your Stay
                </Link>

                <Link
                  href="/rooms"
                  className="inline-flex items-center justify-center border-b border-[#F7F3EA]/40 text-xs font-semibold uppercase tracking-[0.08em] text-[#F7F3EA] transition-colors hover:text-[#FFDF9D]"
                >
                  View Rooms →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
