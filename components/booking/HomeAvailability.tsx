"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { rooms } from "@/data/rooms";

type AvailabilityResponse = {
  success: boolean;
  availableCount?: number;
  error?: string;
};

export default function HomeAvailability() {
  const router = useRouter();

  const [roomSlug, setRoomSlug] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);

  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!roomSlug) {
      setError("Please select a room.");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select your check-in and check-out dates.");
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
        slug: roomSlug,
      });

      const response = await fetch(
        `/api/availability?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = (await response.json()) as AvailabilityResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to check availability."
        );
      }

      if (data.availableCount !== 1) {
        setError(
          "This room is not available for the selected dates. Please choose different dates or another room."
        );
        return;
      }

      const bookingParams = new URLSearchParams({
        checkIn,
        checkOut,
        adults: String(adults),
        children: "0",
        availabilityChecked: "1",
      });

      router.push(
        `/book/${roomSlug}?${bookingParams.toString()}`
      );
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

  return (
    <div className="mx-auto max-w-[1040px] px-5 sm:px-6 lg:px-0">
      <form
        onSubmit={handleSubmit}
        className="border border-[#0B4A32]/10 bg-[#F7F3EA] shadow-[0_16px_40px_rgba(0,50,31,0.08)]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_0.9fr_1.25fr]">

          <label className="border-b border-[#0B4A32]/10 px-7 py-5 md:border-r lg:border-b-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B8B7D]">
              Room
            </span>

            <select
              value={roomSlug}
              onChange={(event) => {
                setRoomSlug(event.target.value);
                setError("");
              }}
              required
              className="mt-2 w-full bg-transparent text-sm text-[#00321F] outline-none"
            >
              <option value="">Select room</option>

              <optgroup label="VIP Rooms">
                {rooms
                  .filter((room) => room.category === "vip")
                  .map((room) => (
                    <option key={room.slug} value={room.slug}>
                      {room.name}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Big Rooms">
                {rooms
                  .filter((room) => room.category === "big")
                  .map((room) => (
                    <option key={room.slug} value={room.slug}>
                      {room.name}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Medium Rooms">
                {rooms
                  .filter((room) => room.category === "medium")
                  .map((room) => (
                    <option key={room.slug} value={room.slug}>
                      {room.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </label>

          <label className="border-b border-[#0B4A32]/10 px-7 py-5 lg:border-b-0 lg:border-r">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B8B7D]">
              Check-in
            </span>

            <input
              type="date"
              value={checkIn}
              onChange={(event) => {
                setCheckIn(event.target.value);
                setError("");
              }}
              required
              className="mt-2 w-full bg-transparent text-sm text-[#00321F] outline-none"
            />
          </label>

          <label className="border-b border-[#0B4A32]/10 px-7 py-5 md:border-r lg:border-b-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B8B7D]">
              Check-out
            </span>

            <input
              type="date"
              value={checkOut}
              onChange={(event) => {
                setCheckOut(event.target.value);
                setError("");
              }}
              required
              className="mt-2 w-full bg-transparent text-sm text-[#00321F] outline-none"
            />
          </label>

          <label className="border-b border-[#0B4A32]/10 px-7 py-5 lg:border-b-0 lg:border-r">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B8B7D]">
              Guests
            </span>

            <select
              value={adults}
              onChange={(event) =>
                setAdults(Number(event.target.value))
              }
              className="mt-2 w-full bg-transparent text-sm text-[#00321F] outline-none"
            >
              {[1, 2, 3, 4].map((value) => (
                <option key={value} value={value}>
                  {value} Adult{value === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center p-4">
            <button
              type="submit"
              disabled={checking}
              className="zaram-button flex h-14 w-full items-center justify-center bg-[#0B4A32] px-5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#145038] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checking
                ? "Checking..."
                : "Check Availability →"}
            </button>
          </div>
        </div>

        {error && (
          <div className="border-t border-red-200 bg-red-50 px-6 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
