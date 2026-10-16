"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type Room = {
  id: number;
  name: string;
  category: string;
};

type Block = {
  id: number;
  room_id: number;
  room_name: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes: string | null;
};

type Props = {
  rooms: Room[];
  blocks: Block[];
};

const reasons = [
  ["maintenance", "Maintenance"],
  ["cleaning", "Cleaning"],
  ["renovation", "Renovation"],
  ["management_hold", "Management Hold"],
  ["out_of_service", "Out of Service"],
  ["other", "Other"],
];

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function RoomBlockManager({
  rooms,
  blocks,
}: Props) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function createBlock(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/rooms/blocks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: Number(data.get("roomId")),
            startDate: data.get("startDate"),
            endDate: data.get("endDate"),
            reason: data.get("reason"),
            notes: data.get("notes"),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to block room."
        );
      }

      form.reset();
      setMessage("Room block created.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to block room."
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeBlock(
    id: number
  ) {
    if (
      !window.confirm(
        "Remove this room block?"
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/rooms/blocks/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to remove block."
        );
      }

      setMessage("Room block removed.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove block."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="border border-[#0B4A32]/10 bg-white p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
          Room Control
        </p>

        <h2 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
          Block a Room
        </h2>

        <p className="mt-2 text-sm text-[#606963]">
          Block a room from public availability for maintenance,
          cleaning or management use.
        </p>

        <form
          onSubmit={createBlock}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
        >
          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
              Room
            </span>

            <select
              name="roomId"
              required
              className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
            >
              <option value="">Select room</option>

              {rooms.map((room) => (
                <option
                  key={room.id}
                  value={room.id}
                >
                  {room.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
              Start Date
            </span>

            <input
              type="date"
              name="startDate"
              required
              className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
            />
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
              End Date
            </span>

            <input
              type="date"
              name="endDate"
              required
              className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
            />
          </label>

          <label>
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
              Reason
            </span>

            <select
              name="reason"
              required
              className="h-11 w-full border border-[#0B4A32]/15 bg-[#F7F3EA] px-3 text-sm text-[#00321F]"
            >
              <option value="">
                Select reason
              </option>

              {reasons.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </label>

          <div className="flex items-end">
            <button
              disabled={busy}
              type="submit"
              className="h-11 w-full bg-[#0B4A32] px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
            >
              Create Block
            </button>
          </div>

          <label className="md:col-span-2 xl:col-span-5">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#59645E]">
              Notes
            </span>

            <textarea
              name="notes"
              rows={3}
              placeholder="Optional internal explanation..."
              className="w-full resize-none border border-[#0B4A32]/15 bg-[#F7F3EA] p-3 text-sm text-[#00321F]"
            />
          </label>
        </form>

        <p className="mt-4 text-xs text-[#68726C]">
          The end date is the date the room becomes available again.
        </p>

        {message && (
          <p className="mt-4 text-sm font-medium text-[#0B4A32]">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
      </section>

      <section className="border border-[#0B4A32]/10 bg-white">
        <div className="border-b border-[#0B4A32]/10 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B88923]">
            Operations
          </p>

          <h2 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
            Active & Upcoming Blocks
          </h2>
        </div>

        {blocks.length === 0 ? (
          <p className="p-8 text-sm text-[#606963]">
            No active or upcoming room blocks.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="bg-[#EAE1D5]">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                    Room
                  </th>

                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                    Dates
                  </th>

                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                    Reason
                  </th>

                  <th className="px-6 py-4 text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                    Notes
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] uppercase tracking-[0.12em] text-[#59645E]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {blocks.map((block) => (
                  <tr
                    key={block.id}
                    className="border-b border-[#0B4A32]/8 last:border-0"
                  >
                    <td className="px-6 py-5 font-semibold text-[#00321F]">
                      {block.room_name}
                    </td>

                    <td className="px-6 py-5 text-sm text-[#404943]">
                      {displayDate(block.start_date)}
                      <br />
                      <span className="text-[#7A817D]">
                        to {displayDate(block.end_date)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-red-700">
                        {block.reason.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="max-w-[320px] px-6 py-5 text-sm text-[#606963]">
                      {block.notes || "—"}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          removeBlock(block.id)
                        }
                        className="text-xs font-semibold uppercase tracking-[0.08em] text-red-700 disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
