import MockPayment from "@/components/booking/MockPayment";

type PageProps = {
  params: Promise<{
    reference: string;
  }>;
};

export default async function PaymentPage({ params }: PageProps) {
  const { reference } = await params;

  return (
    <main className="min-h-screen bg-[#F7F3EA] pt-20">
      <section className="bg-[#00321F] py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-[#FFDF9D]">
            Secure Checkout
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold text-white md:text-5xl">
            Complete Payment
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-6">
          <MockPayment reference={reference} />
        </div>
      </section>
    </main>
  );
}
