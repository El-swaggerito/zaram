export default function LocationMap() {
  const address =
    "EFAB Global Estate, Road 121, House 8, Abuja, Nigeria";

  const mapQuery = encodeURIComponent(address);

  return (
    <section className="bg-[#F7F3EA] py-16 md:py-20">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 overflow-hidden border border-[#0B4A32]/10 bg-white lg:grid-cols-[0.8fr_1.2fr]">

          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-[#B88923]">
              Find Us
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold text-[#00321F] md:text-4xl">
              Visit Zaram Hotels & Garden
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#606963]">
              Conveniently located within EFAB Global Estate in Abuja.
              Use the map to find the hotel or open the location directly
              in Google Maps for directions.
            </p>

            <div className="mt-7 border-l-2 border-[#B88923] pl-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A817D]">
                Address
              </p>

              <address className="mt-2 not-italic text-base leading-7 text-[#00321F]">
                EFAB Global Estate
                <br />
                Road 121, House 8
                <br />
                Abuja, Nigeria
              </address>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 w-fit items-center justify-center bg-[#0B4A32] px-7 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#145038]"
            >
              Open in Google Maps
            </a>
          </div>

          <div className="min-h-[420px] lg:min-h-[520px]">
            <iframe
              title="Zaram Hotels & Garden location"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[420px] w-full border-0 lg:h-[520px]"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
