"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  reference: string;
  bookingStatus: string;
  managementNotes: string | null;
};

type ActionName =
  | "check_in"
  | "check_out"
  | "cancel"
  | "no_show";

export default function BookingActions({
  reference,
  bookingStatus,
  managementNotes,
}: Props) {
  const router = useRouter();

  const [notes, setNotes] = useState(
    managementNotes ?? ""
  );

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function performAction(action: ActionName) {
    if (
      action === "cancel" &&
      !window.confirm(
        "Cancel this booking? This does not automatically refund a payment."
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/bookings/${reference}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to update booking."
        );
      }

      setMessage("Booking updated successfully.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update booking."
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveNotes(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/bookings/${reference}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "update_notes",
            notes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to save notes."
        );
      }

      setMessage("Management notes saved.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save notes."
      );
    } finally {
      setBusy(false);
    }
  }

  const canCheckIn = bookingStatus === "confirmed";
  const canCheckOut = bookingStatus === "checked_in";
  const canCancel =
    bookingStatus === "confirmed" ||
    bookingStatus === "pending";
  const canNoShow = bookingStatus === "confirmed";

  return (
    <div className="space-y-6">
      <section className="border border-[#0B4A32]/10 bg-white p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
          Booking Actions
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!canCheckIn || busy}
            onClick={() => performAction("check_in")}
            className="h-11 bg-[#0B4A32] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Check In
          </button>

          <button
            type="button"
            disabled={!canCheckOut || busy}
            onClick={() => performAction("check_out")}
            className="h-11 bg-[#0B4A32] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Check Out
          </button>

          <button
            type="button"
            disabled={!canNoShow || busy}
            onClick={() => performAction("no_show")}
            className="h-11 border border-[#B88923]/40 bg-[#FFF8E8] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-[#8A671C] disabled:cursor-not-allowed disabled:opacity-30"
          >
            Mark No Show
          </button>

          <button
            type="button"
            disabled={!canCancel || busy}
            onClick={() => performAction("cancel")}
            className="h-11 border border-red-200 bg-red-50 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Cancel Booking
          </button>
        </div>

        <p className="mt-4 text-xs leading-5 text-[#69736D]">
          Cancelling a paid booking does not automatically
          refund the payment. Refund handling will be added
          with Paystack.
        </p>
      </section>

      <form
        onSubmit={saveNotes}
        className="border border-[#0B4A32]/10 bg-white p-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B88923]">
          Management Notes
        </p>

        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          rows={6}
          placeholder="Internal notes for this reservation..."
          className="mt-4 w-full resize-none border border-[#0B4A32]/15 bg-[#F7F3EA] p-4 text-sm leading-6 text-[#00321F] outline-none focus:border-[#B88923]"
        />

        <button
          type="submit"
          disabled={busy}
          className="mt-4 h-11 bg-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
        >
          Save Notes
        </button>

        {message && (
          <p className="mt-4 text-sm text-[#0B4A32]">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
