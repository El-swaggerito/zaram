import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import RoomImage from "@/components/rooms/RoomImage";
import Reveal from "@/components/ui/Reveal";
import {
  formatNaira,
  getRoomBySlug,
  rooms,
} from "@/data/rooms";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return rooms.map((room) => ({
    slug: room.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomBySlug(slug);

  if (!room) {
    return {
      title: "Room Not Found",
    };
  }

  return {
    title: `${room.name} Room`,
    description: room.shortDescription,
  };
}

export default async function RoomDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  return (
    <main className="bg-[#F7F3EA] pt-20">

      {/* HERO IMAGE */}
      <section className="relative h-[52vh] min-h-[430px] max-h-[680px] overflow-hidden bg-[#174735]">

        <RoomImage
          src={room.image}
          alt={`${room.name} room`}
          className="absolute inset-0"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#00321F]/90 via-[#00321F]/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10">

          <div className="mx-auto max-w-[1280px] px-5 pb-12 sm:px-6 md:pb-16 lg:px-10">

            <p className="zaram-hero-reveal zaram-delay-1 text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
              {room.categoryLabel}
            </p>

            <h1 className="zaram-hero-reveal zaram-delay-2 mt-2 font-serif text-5xl font-semibold text-white md:text-7xl">
              {room.name}
            </h1>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="py-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-20">

            <div className="lg:col-span-7">
              <Reveal direction="left">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                    {room.categoryLabel} Room
                  </p>

                  <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#00321F] md:text-5xl">
                    Your {room.name} Stay
                  </h2>

                  <p className="mt-6 max-w-2xl text-[15px] leading-8 text-[#404943]">
                    {room.shortDescription}
                  </p>

                  <div className="mt-10 grid grid-cols-1 gap-px bg-[#0B4A32]/10 sm:grid-cols-3">

                    <div className="bg-[#EAE1D5] p-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#404943]/70">
                        Room Rate
                      </p>

                      <p className="mt-2 font-serif text-xl font-semibold text-[#00321F]">
                        {formatNaira(room.baseRateKobo)}
                      </p>
                    </div>

                    <div className="bg-[#EAE1D5] p-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#404943]/70">
                        VAT 7.5%
                      </p>

                      <p className="mt-2 font-serif text-xl font-semibold text-[#00321F]">
                        {formatNaira(room.vatKobo)}
                      </p>
                    </div>

                    <div className="bg-[#EAE1D5] p-6">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#B88923]">
                        Total / Night
                      </p>

                      <p className="mt-2 font-serif text-xl font-semibold text-[#00321F]">
                        {formatNaira(room.totalRateKobo)}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* BOOKING CARD */}
            <div className="lg:col-span-5">

              <Reveal direction="right" delay={120}>

                <div className="border border-[#0B4A32]/10 bg-[#EAE1D5] p-8">

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                    Reserve This Room
                  </p>

                  <h3 className="mt-3 font-serif text-3xl font-semibold text-[#00321F]">
                    {room.name}
                  </h3>

                  <div className="mt-5 border-y border-[#0B4A32]/10 py-5">

                    <p className="font-serif text-3xl font-semibold text-[#00321F]">
                      {formatNaira(room.totalRateKobo)}
                    </p>

                    <p className="mt-1 text-xs text-[#404943]">
                      per night, including 7.5% VAT
                    </p>
                  </div>

                  <p className="mt-6 text-sm leading-7 text-[#404943]">
                    Availability is checked specifically for the {room.name}
                    room.
                  </p>

                  <Link
                    href={`/book/${room.slug}`}
                    className="zaram-button mt-7 inline-flex h-12 w-full items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
                  >
                    Book {room.name}
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* BACK */}
      <section className="bg-[#EAE1D5] py-12">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">

          <Link
            href="/rooms"
            className="zaram-link text-xs font-semibold uppercase tracking-[0.10em] text-[#00321F] hover:text-[#B88923]"
          >
            ← View All Rooms
          </Link>
        </div>
      </section>
    </main>
  );
}
