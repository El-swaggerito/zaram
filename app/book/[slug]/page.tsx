import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BookingAvailability from "@/components/booking/BookingAvailability";
import { getRoomBySlug, rooms } from "@/data/rooms";

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
    title: `Book ${room.name}`,
    description: `Check availability and book the ${room.name} room at Zaram Hotels & Garden.`,
  };
}

export default async function BookRoomPage({ params }: PageProps) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F7F3EA] pt-20">
      <section className="bg-[#00321F] py-16 md:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
            Reservations
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold text-white md:text-6xl">
            Book {room.name}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
            Select your dates first. We will check live availability for this
            specific room before you continue.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
          <BookingAvailability
            room={{
              name: room.name,
              slug: room.slug,
              categoryLabel: room.categoryLabel,
              totalRateKobo: room.totalRateKobo,
            }}
          />
        </div>
      </section>

      <section className="bg-[#EAE1D5] py-10">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
          <Link
            href={`/rooms/${room.slug}`}
            className="zaram-link text-xs font-semibold uppercase tracking-[0.10em] text-[#00321F] hover:text-[#B88923]"
          >
            ← Back to {room.name}
          </Link>
        </div>
      </section>
    </main>
  );
}
