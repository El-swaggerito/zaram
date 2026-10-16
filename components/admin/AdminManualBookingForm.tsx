"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type Room = {
  id: number;
  name: string;
  slug: string;
  category: string;
};

type Props = {
  rooms: Room[];
};

export default function AdminManualBookingForm({
  rooms,
}: Props) {
  const router = useRouter();

  const [roomSlug, setRoomSlug] =
    useState("");
  const [checkIn, setCheckIn] =
    useState("");
  const [checkOut, setCheckOut] =
    useState("");

  const [adults, setAdults] =
    useState("1");
  const [children, setChildren] =
    useState("0");

  const [
    availabilityChecked,
    setAvailabilityChecked,
  ] = useState(false);

  const [checking, setChecking] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [availabilityMessage, setAvailabilityMessage] =
    useState("");

  const [
    paymentReceived,
    setPaymentReceived,
  ] = useState("no");

  function resetAvailability() {
    setAvailabilityChecked(false);
    setAvailabilityMessage("");
    setError("");
  }

  async function checkAvailability() {
    setError("");
    setAvailabilityMessage("");

    if (
      !roomSlug ||
      !checkIn ||
      !checkOut
    ) {
      setError(
        "Select a room, check-in date and check-out date."
      );
      return;
    }

    if (checkOut <= checkIn) {
      setError(
        "Check-out must be after check-in."
      );
      return;
    }

    setChecking(true);

    try {
      const params =
        new URLSearchParams({
          slug: roomSlug,
          checkIn,
          checkOut,
        });

      const response = await fetch(
        `/api/availability?${params.toString()}`
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to check availability."
        );
      }

      if (
        Number(result.availableCount) < 1
      ) {
        setAvailabilityChecked(false);
        setError(
          "This room is not available for the selected dates."
        );
        return;
      }

      setAvailabilityChecked(true);
      setAvailabilityMessage(
        "Room is available. You can continue with the guest details."
      );
    } catch (err) {
      setAvailabilityChecked(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to check availability."
      );
    } finally {
      setChecking(false);
    }
  }

  async function createBooking(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!availabilityChecked) {
      setError(
        "Check room availability first."
      );
      return;
    }

    const form =
      event.currentTarget;

    const data =
      new FormData(form);

    setSubmitting(true);
    setError("");

    try {
      /*
       * Step 1:
       * Reuse the existing booking hold API.
       * This performs the authoritative server-side
       * availability check and calculates the price.
       */
      const holdResponse =
        await fetch(
          "/api/bookings/hold",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              roomSlug,
              checkIn,
              checkOut,
              adults:
                Number(adults),
              children:
                Number(children),
              fullName:
                data.get("fullName"),
              email:
                data.get("email"),
              phone:
                data.get("phone"),
              nationality:
                data.get(
                  "nationality"
                ),
              specialRequests:
                data.get(
                  "specialRequests"
                ),
            }),
          }
        );

      const holdResult =
        await holdResponse.json();

      if (
        !holdResponse.ok ||
        !holdResult.success
      ) {
        throw new Error(
          holdResult.error ||
            "Unable to reserve this room."
        );
      }

      const reference =
        holdResult.reference ||
        holdResult.bookingReference ||
        holdResult.booking?.reference;

      if (!reference) {
        console.error(
          "Unexpected hold response:",
          holdResult
        );

        throw new Error(
          "Booking reference was not returned by the reservation system."
        );
      }

      /*
       * Step 2:
       * Convert the temporary hold into an
       * administrator-created confirmed booking.
       */
      const confirmResponse =
        await fetch(
          `/api/admin/bookings/${reference}`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action:
                "confirm_manual",
              paymentReceived:
                paymentReceived ===
                "yes",
              paymentMethod:
                paymentReceived ===
                "yes"
                  ? data.get(
                      "paymentMethod"
                    )
                  : null,
              notes:
                data.get(
                  "managementNotes"
                ),
            }),
          }
        );

      const confirmResult =
        await confirmResponse.json();

      if (
        !confirmResponse.ok ||
        !confirmResult.success
      ) {
        throw new Error(
          confirmResult.error ||
            "Unable to confirm the booking."
        );
      }

      router.push(
        `/admin/bookings/${reference}`
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create booking."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={createBooking}
      className="space-y-6"
    >
      {/* ROOM + DATES */}
      <section className="border border-[#0B4A32]/10 bg-white p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
          Step 1
        </p>

        <h2 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
          Room & Stay
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
              Room
            </span>

            <select
              value={roomSlug}
              onChange={(event) => {
                setRoomSlug(
                  event.target.value
                );
                resetAvailability();
              }}
              required
              className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
            >
              <option value="">
                Select room
              </option>

              {rooms.map((room) => (
                <option
                  key={room.id}
                  value={room.slug}
                >
                  {room.name} ·{" "}
                  {room.category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
              Check-in
            </span>

            <input
              type="date"
              value={checkIn}
              onChange={(event) => {
                setCheckIn(
                  event.target.value
                );
                resetAvailability();
              }}
              required
              className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
            />
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
              Check-out
            </span>

            <input
              type="date"
              value={checkOut}
              onChange={(event) => {
                setCheckOut(
                  event.target.value
                );
                resetAvailability();
              }}
              required
              className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
            />
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
              Adults
            </span>

            <select
              value={adults}
              onChange={(event) =>
                setAdults(
                  event.target.value
                )
              }
              className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
            >
              {[1, 2, 3, 4].map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
              Children
            </span>

            <select
              value={children}
              onChange={(event) =>
                setChildren(
                  event.target.value
                )
              }
              className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
            >
              {[0, 1, 2, 3].map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={
            checkAvailability
          }
          disabled={checking}
          className="mt-5 h-11 bg-[#0B4A32] px-7 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
        >
          {checking
            ? "Checking..."
            : "Check Availability"}
        </button>

        {availabilityMessage && (
          <p className="mt-4 text-sm font-medium text-[#0B4A32]">
            {availabilityMessage}
          </p>
        )}
      </section>

      {availabilityChecked && (
        <>
          {/* GUEST */}
          <section className="border border-[#0B4A32]/10 bg-white p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
              Step 2
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
              Guest Details
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                  Full Name
                </span>

                <input
                  name="fullName"
                  required
                  className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-4 text-sm text-[#00321F]"
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                  Email
                </span>

                <input
                  type="email"
                  name="email"
                  required
                  className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-4 text-sm text-[#00321F]"
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                  Phone
                </span>

                <input
                  type="tel"
                  name="phone"
                  required
                  className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-4 text-sm text-[#00321F]"
                />
              </label>

              <label>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                  Nationality
                </span>

                <input
                  name="nationality"
                  className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-4 text-sm text-[#00321F]"
                />
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                  Guest Requests
                </span>

                <textarea
                  name="specialRequests"
                  rows={3}
                  className="w-full resize-none border border-[#0B4A32]/15 bg-[#F7F3EA] p-4 text-sm text-[#00321F]"
                />
              </label>
            </div>
          </section>

          {/* PAYMENT */}
          <section className="border border-[#0B4A32]/10 bg-white p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
              Step 3
            </p>

            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
              Payment & Confirmation
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                  Payment Received?
                </span>

                <select
                  value={
                    paymentReceived
                  }
                  onChange={(event) =>
                    setPaymentReceived(
                      event.target.value
                    )
                  }
                  className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
                >
                  <option value="no">
                    No · Mark unpaid
                  </option>

                  <option value="yes">
                    Yes · Mark paid
                  </option>
                </select>
              </label>

              {paymentReceived ===
                "yes" && (
                <label>
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                    Payment Method
                  </span>

                  <select
                    name="paymentMethod"
                    required
                    className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
                  >
                    <option value="">
                      Select method
                    </option>

                    <option value="cash">
                      Cash
                    </option>

                    <option value="pos">
                      POS
                    </option>

                    <option value="bank_transfer">
                      Bank Transfer
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </label>
              )}

              <label className="md:col-span-2">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
                  Management Notes
                </span>

                <textarea
                  name="managementNotes"
                  rows={3}
                  placeholder="Optional internal notes..."
                  className="w-full resize-none border border-[#0B4A32]/15 bg-[#F7F3EA] p-4 text-sm text-[#00321F]"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 h-12 bg-[#0B4A32] px-8 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
            >
              {submitting
                ? "Creating Booking..."
                : "Create Booking"}
            </button>
          </section>
        </>
      )}

      {error && (
        <div className="border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
    </form>
  );
}
