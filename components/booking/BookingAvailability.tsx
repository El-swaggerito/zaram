"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { formatNaira } from "@/data/rooms";

type Props = {
  room: {
    name: string;
    slug: string;
    categoryLabel: string;
    totalRateKobo: number;
  };
};

type AvailabilityResponse = {
  success: boolean;
  availableCount?: number;
  error?: string;
};

type HoldResponse = {
  success: boolean;
  error?: string;
  booking?: {
    reference: string;
    paymentReference: string;
    holdExpiresAt: string;
    holdMinutes: number;
    totalAmountKobo: number;
  };
};

function nightsBetween(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);

  return Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default function BookingAvailability({ room }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [showGuestForm, setShowGuestForm] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const [creatingHold, setCreatingHold] = useState(false);
  const [hold, setHold] = useState<HoldResponse["booking"] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const initialCheckIn = searchParams.get("checkIn");
    const initialCheckOut = searchParams.get("checkOut");
    const initialAdults = searchParams.get("adults");
    const initialChildren = searchParams.get("children");
    const availabilityChecked = searchParams.get("availabilityChecked");

    if (initialCheckIn) {
      setCheckIn(initialCheckIn);
    }

    if (initialCheckOut) {
      setCheckOut(initialCheckOut);
    }

    if (initialAdults) {
      const value = Number(initialAdults);

      if (Number.isInteger(value) && value >= 1 && value <= 4) {
        setAdults(value);
      }
    }

    if (initialChildren) {
      const value = Number(initialChildren);

      if (Number.isInteger(value) && value >= 0 && value <= 3) {
        setChildren(value);
      }
    }

    if (
      availabilityChecked === "1" &&
      initialCheckIn &&
      initialCheckOut &&
      initialCheckOut > initialCheckIn
    ) {
      setAvailable(true);
    }
  }, [searchParams]);

  const nights =
    checkIn && checkOut && checkOut > checkIn
      ? nightsBetween(checkIn, checkOut)
      : 0;

  const totalKobo = nights * room.totalRateKobo;

  function resetAvailability() {
    setAvailable(null);
    setShowGuestForm(false);
    setHold(null);
    setError("");
  }

  async function checkAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setAvailable(null);
    setShowGuestForm(false);
    setHold(null);

    if (!checkIn || !checkOut) {
      setError("Please select both your check-in and check-out dates.");
      return;
    }

    if (checkOut <= checkIn) {
      setError("Check-out must be later than check-in.");
      return;
    }

    setChecking(true);

    try {
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        slug: room.slug,
      });

      const response = await fetch(`/api/availability?${params.toString()}`, {
        cache: "no-store",
      });

      const data = (await response.json()) as AvailabilityResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to check availability.");
      }

      setAvailable(data.availableCount === 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check availability. Please try again."
      );
    } finally {
      setChecking(false);
    }
  }

  async function createHold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setCreatingHold(true);

    try {
      const response = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomSlug: room.slug,
          checkIn,
          checkOut,
          adults,
          children,
          fullName,
          email,
          phone,
          nationality,
          specialRequests,
        }),
      });

      const data = (await response.json()) as HoldResponse;

      if (!response.ok || !data.success || !data.booking) {
        throw new Error(
          data.error || "Unable to create your booking hold."
        );
      }

      setHold(data.booking);
      setShowGuestForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your booking hold. Please try again."
      );
    } finally {
      setCreatingHold(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        {!hold && (
          <>
            <form
              onSubmit={checkAvailability}
              className="border border-[#0B4A32]/10 bg-white p-6 sm:p-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                Check Availability
              </p>

              <h2 className="mt-3 font-serif text-3xl font-semibold text-[#00321F] sm:text-4xl">
                Select your stay
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#404943]">
                Availability will be checked specifically for the {room.name} room.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
                    Check-in
                  </span>

                  <input
                    type="date"
                    value={checkIn}
                    onChange={(event) => {
                      setCheckIn(event.target.value);
                      resetAvailability();
                    }}
                    required
                    className="h-12 w-full border border-[#0B4A32]/20 bg-[#F7F3EA] px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
                    Check-out
                  </span>

                  <input
                    type="date"
                    value={checkOut}
                    onChange={(event) => {
                      setCheckOut(event.target.value);
                      resetAvailability();
                    }}
                    required
                    className="h-12 w-full border border-[#0B4A32]/20 bg-[#F7F3EA] px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
                    Adults
                  </span>

                  <select
                    value={adults}
                    onChange={(event) => {
                      setAdults(Number(event.target.value));
                      resetAvailability();
                    }}
                    className="h-12 w-full border border-[#0B4A32]/20 bg-[#F7F3EA] px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
                  >
                    {[1, 2, 3, 4].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
                    Children
                  </span>

                  <select
                    value={children}
                    onChange={(event) => {
                      setChildren(Number(event.target.value));
                      resetAvailability();
                    }}
                    className="h-12 w-full border border-[#0B4A32]/20 bg-[#F7F3EA] px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
                  >
                    {[0, 1, 2, 3].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {error && !showGuestForm && (
                <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={checking}
                className="zaram-button mt-7 inline-flex h-12 w-full items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checking ? "Checking..." : "Check Availability"}
              </button>

              {available === true && !showGuestForm && (
                <div className="mt-6 border border-[#0B4A32]/20 bg-[#EEF4EF] p-5">
                  <p className="font-semibold text-[#0B4A32]">
                    {room.name} is available for these dates.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#404943]">
                    Your room is not reserved yet. A temporary 15-minute hold
                    will begin after you submit your guest details.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setShowGuestForm(true);
                    }}
                    className="zaram-button mt-5 inline-flex h-12 w-full items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
                  >
                    Continue to Guest Details
                  </button>
                </div>
              )}

              {available === false && (
                <div className="mt-6 border border-[#B88923]/30 bg-[#FFF8E8] p-5">
                  <p className="font-semibold text-[#8A671C]">
                    {room.name} is not available for these dates.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#404943]">
                    Please select different check-in or check-out dates.
                  </p>
                </div>
              )}
            </form>

            {showGuestForm && (
              <form
                onSubmit={createHold}
                className="mt-8 border border-[#0B4A32]/10 bg-white p-6 sm:p-8"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
                  Guest Details
                </p>

                <h2 className="mt-3 font-serif text-3xl font-semibold text-[#00321F]">
                  Who is staying?
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#404943]">
                  Enter the lead guest details below. Your 15-minute payment
                  hold begins after this form is submitted.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
                      Full Name
                    </span>

                    <input
                      type="text"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                      autoComplete="name"
                      className="h-12 w-full border border-[#0B4A32]/20 bg-[#F7F3EA] px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
                      Email
                    </span>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      autoComplete="email"
                      className="h-12 w-full border border-[#0B4A32]/20 bg-[#F7F3EA] px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
                      Phone
                    </span>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      required
                      autoComplete="tel"
                      className="h-12 w-full border border-[#0B4A32]/20 bg-[#F7F3EA] px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
                    />
                  </label>

                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
                      Nationality
                    </span>

                    <input
                      type="text"
                      value={nationality}
                      onChange={(event) => setNationality(event.target.value)}
                      autoComplete="country-name"
                      className="h-12 w-full border border-[#0B4A32]/20 bg-[#F7F3EA] px-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
                    />
                  </label>

                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#00321F]">
                      Special Requests
                    </span>

                    <textarea
                      value={specialRequests}
                      onChange={(event) =>
                        setSpecialRequests(event.target.value)
                      }
                      rows={4}
                      className="w-full resize-none border border-[#0B4A32]/20 bg-[#F7F3EA] p-4 text-sm text-[#00321F] outline-none focus:border-[#B88923]"
                    />
                  </label>
                </div>

                {error && (
                  <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creatingHold}
                  className="zaram-button mt-7 inline-flex h-12 w-full items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingHold
                    ? "Reserving Room..."
                    : "Continue to Payment"}
                </button>
              </form>
            )}
          </>
        )}

        {hold && (
          <div className="border border-[#0B4A32]/20 bg-[#EEF4EF] p-7 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
              Room Held
            </p>

            <h2 className="mt-3 font-serif text-3xl font-semibold text-[#00321F] sm:text-4xl">
              Your room is temporarily reserved
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#404943]">
              We have placed a {hold.holdMinutes}-minute hold on the {room.name} room
              while you complete payment.
            </p>

            <div className="mt-7 border-y border-[#0B4A32]/10 py-5">
              <div className="flex justify-between gap-6 text-sm">
                <span className="text-[#404943]">Booking reference</span>
                <span className="font-semibold text-[#00321F]">
                  {hold.reference}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-6 text-sm">
                <span className="text-[#404943]">Amount due</span>
                <span className="font-semibold text-[#00321F]">
                  {formatNaira(hold.totalAmountKobo)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/payment/${hold.reference}`)}
              className="zaram-button mt-7 inline-flex h-12 w-full items-center justify-center bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038]"
            >
              Proceed to Mock Payment
            </button>

            <p className="mt-3 text-center text-xs text-[#404943]/70">
              Payment is not yet complete. Your booking is still pending.
            </p>
          </div>
        )}
      </div>

      <div className="lg:col-span-5">
        <div className="border border-[#0B4A32]/10 bg-[#EAE1D5] p-7 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
            Booking Summary
          </p>

          <h3 className="mt-3 font-serif text-3xl font-semibold text-[#00321F]">
            {room.name}
          </h3>

          <p className="mt-1 text-sm text-[#404943]">
            {room.categoryLabel}
          </p>

          <div className="mt-6 space-y-4 border-y border-[#0B4A32]/10 py-6 text-sm">
            <div className="flex items-center justify-between gap-6">
              <span className="text-[#404943]">Rate per night</span>
              <span className="font-semibold text-[#00321F]">
                {formatNaira(room.totalRateKobo)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="text-[#404943]">Check-in</span>
              <span className="font-semibold text-[#00321F]">
                {checkIn || "Not selected"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="text-[#404943]">Check-out</span>
              <span className="font-semibold text-[#00321F]">
                {checkOut || "Not selected"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="text-[#404943]">Guests</span>
              <span className="font-semibold text-[#00321F]">
                {adults} adult{adults !== 1 ? "s" : ""}
                {children > 0
                  ? `, ${children} child${children !== 1 ? "ren" : ""}`
                  : ""}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="text-[#404943]">Nights</span>
              <span className="font-semibold text-[#00321F]">
                {nights || "—"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between gap-6">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#404943]">
              Total
            </span>

            <span className="font-serif text-3xl font-semibold text-[#00321F]">
              {nights > 0 ? formatNaira(totalKobo) : "—"}
            </span>
          </div>

          <p className="mt-2 text-right text-xs text-[#404943]/70">
            including 7.5% VAT
          </p>
        </div>
      </div>
    </div>
  );
}
