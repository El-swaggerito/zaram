import type { Metadata } from "next";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-zaram-ivory">
      <Container className="py-24">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zaram-gold-600">
          About
        </p>

        <h1 className="font-serif text-5xl text-zaram-green-900 md:text-6xl">
          About page ready for Stitch conversion.
        </h1>
      </Container>
    </main>
  );
}
