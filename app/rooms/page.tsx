import type { Metadata } from "next";
import Link from "next/link";

import Reveal from "@/components/ui/Reveal";
import RoomImage from "@/components/rooms/RoomImage";
import { formatNaira, rooms } from "@/data/rooms";

export const metadata: Metadata = {
  title: "Rooms",
};

const groups = [
  {
    id: "vip",
    title: "VIP Rooms",
    subtitle: "Our premium accommodation category",
  },
  {
    id: "big",
    title: "Big Rooms",
    subtitle: "Generous spaces designed for comfort",
  },
  {
    id: "medium",
    title: "Medium Rooms",
    subtitle: "Comfortable rooms for a relaxing stay",
  },
];

export default function RoomsPage() {
  return (
    <main className="bg-[#F7F3EA] pt-20">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0B4A32] py-24 text-white md:py-32">

        <div className="absolute inset-0 bg-[#174735]" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#00321F] via-[#00321F]/75 to-[#00321F]/20" />

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 pb-12 sm:px-6 md:pb-16 lg:px-10">

          <div className="max-w-2xl">

            <p className="zaram-hero-reveal zaram-delay-1 text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
              Rooms & Accommodation
            </p>

            <h1 className="zaram-hero-reveal zaram-delay-2 mt-3 font-serif text-4xl font-semibold leading-tight text-[#F7F3EA] md:text-6xl">
              Choose Your Room
            </h1>

            <p className="zaram-hero-reveal zaram-delay-3 mt-4 max-w-xl text-[15px] leading-7 text-[#DFE4DA]">
              Every room at Zaram has its own identity. Browse our individual
              rooms and choose the exact room you would like to stay in.
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
                    Our Rooms
                  </p>

                  <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#00321F] md:text-5xl">
                    Eight Rooms. Three Categories.
                  </h2>
                </div>
              </Reveal>
            </div>

            <div className="md:col-span-6 md:pt-6">
              <Reveal direction="right" delay={120}>

                <div>
                  <p className="text-base leading-8 text-[#404943] md:text-lg">
                    Select the actual room you would like to reserve. Availability
                    is tracked separately for every room.
                  </p>

                  <p className="mt-4 text-sm leading-7 text-[#404943]">
                    All displayed rates are per night and include 7.5% VAT.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ROOM GROUPS */}
      {groups.map((group, groupIndex) => {

        const categoryRooms = rooms.filter(
          (room) => room.category === group.id
        );

        return (
          <section
            key={group.id}
            id={group.id}
            className={
              groupIndex % 2 === 0
                ? "bg-[#EAE1D5] py-24"
                : "bg-[#F7F3EA] py-24"
            }
          >
            <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

              <Reveal direction="up">
                <div className="mb-12 border-b border-[#0B4A32]/10 pb-8">

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                    {group.subtitle}
                  </p>

                  <h2 className="mt-2 font-serif text-4xl font-semibold text-[#00321F] md:text-5xl">
                    {group.title}
                  </h2>
                </div>
              </Reveal>

              <div
                className={[
                  "grid grid-cols-1 gap-8",
                  categoryRooms.length === 2
                    ? "md:grid-cols-2"
                    : "md:grid-cols-2 lg:grid-cols-3",
                ].join(" ")}
              >
                {categoryRooms.map((room, index) => (
                  <Reveal
                    key={room.id}
                    direction="up"
                    delay={index * 100}
                  >
                    <article className="group flex h-full flex-col bg-[#F7F3EA]">

                      <Link
                        href={`/rooms/${room.slug}`}
                        className="zaram-image-hover block aspect-[4/3] overflow-hidden bg-[#DDD5C8]"
                      >
                        <RoomImage
                          src={room.image}
                          alt={`${room.name} room`}
                        />
                      </Link>

                      <div className="flex flex-1 flex-col p-7">

                        <div className="flex items-start justify-between gap-5">

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
                              {room.categoryLabel}
                            </p>

                            <h3 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
                              {room.name}
                            </h3>
                          </div>

                          <div className="shrink-0 text-right">

                            <p className="font-serif text-xl font-semibold text-[#00321F]">
                              {formatNaira(room.totalRateKobo)}
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#404943]/70">
                              per night
                            </p>
                          </div>
                        </div>

                        <p className="mt-5 flex-1 text-sm leading-7 text-[#404943]">
                          {room.shortDescription}
                        </p>

                        <p className="mt-4 text-xs text-[#404943]/70">
                          Rate includes 7.5% VAT.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">

                          <Link
                            href={`/rooms/${room.slug}`}
                            className="zaram-button inline-flex h-11 items-center justify-center border border-[#0B4A32]/20 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F] hover:bg-[#EAE1D5]"
                          >
                            View Room
                          </Link>

                          <Link
                            href={`/book/${room.slug}`}
                            className="zaram-button inline-flex h-11 items-center justify-center bg-[#0B4A32] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
                          >
                            Book This Room
                          </Link>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* RATE NOTE */}
      <section className="bg-[#F7F3EA] py-16">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <Reveal direction="up">

            <div className="border-l-2 border-[#C89D35] bg-[#EAE1D5] p-6 md:p-8">

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#B88923]">
                Rate Note
              </p>

              <p className="mt-3 text-sm leading-7 text-[#404943]">
                All room rates shown are inclusive of 7.5% VAT. Rates are per
                night and subject to review by management.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
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
