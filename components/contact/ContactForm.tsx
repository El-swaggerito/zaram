"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function ContactForm() {
  const searchParams = useSearchParams();

  const [enquiryType, setEnquiryType] = useState("room");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const room = searchParams.get("room");

    if (room) {
      setEnquiryType("reservation");
    }
  }, [searchParams]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitted(true);

    const form = event.currentTarget;
    form.reset();

    const room = searchParams.get("room");

    if (room) {
      setEnquiryType("reservation");
    } else {
      setEnquiryType("room");
    }
  }

  return (
    <div
      id="reservation"
      className="bg-[#F1F5EB] p-7 sm:p-10"
    >
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B88923]">
          Message Desk
        </p>

        <h3 className="mt-2 font-serif text-3xl font-semibold text-[#00321F]">
          Send an Enquiry
        </h3>

        <p className="mt-2 text-sm text-[#404943]">
          Our front office will respond as soon as possible.
        </p>
      </div>

      {submitted && (
        <div
          role="status"
          className="mb-6 border border-[#0B4A32]/15 bg-[#EAE1D5] px-5 py-4 text-sm text-[#0B4A32]"
        >
          Thank you. Your enquiry has been recorded.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.10em] text-[#20251F]">
              Full Name
            </span>

            <input
              required
              type="text"
              name="fullName"
              placeholder="e.g. John Doe"
              className="h-12 bg-white px-4 text-sm text-[#20251F] outline-none ring-1 ring-transparent transition focus:ring-[#C89D35]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.10em] text-[#20251F]">
              Email Address
            </span>

            <input
              required
              type="email"
              name="email"
              placeholder="e.g. john@example.com"
              className="h-12 bg-white px-4 text-sm text-[#20251F] outline-none ring-1 ring-transparent transition focus:ring-[#C89D35]"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.10em] text-[#20251F]">
              Phone Number
            </span>

            <input
              type="tel"
              name="phone"
              placeholder="e.g. +234 800 000 0000"
              className="h-12 bg-white px-4 text-sm text-[#20251F] outline-none ring-1 ring-transparent transition focus:ring-[#C89D35]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.10em] text-[#20251F]">
              Enquiry Type
            </span>

            <select
              name="enquiryType"
              value={enquiryType}
              onChange={(event) => setEnquiryType(event.target.value)}
              className="h-12 cursor-pointer bg-white px-4 text-sm text-[#20251F] outline-none ring-1 ring-transparent transition focus:ring-[#C89D35]"
            >
              <option value="room">Room Enquiry</option>
              <option value="reservation">Reservation</option>
              <option value="general">General Enquiry</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.10em] text-[#20251F]">
            Message
          </span>

          <textarea
            required
            name="message"
            rows={5}
            placeholder="Tell us how we can assist you..."
            className="resize-none bg-white p-4 text-sm text-[#20251F] outline-none ring-1 ring-transparent transition focus:ring-[#C89D35]"
          />
        </label>

        <button
          type="submit"
          className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 bg-[#0B4A32] px-6 text-xs font-semibold uppercase tracking-[0.10em] text-[#F7F3EA] transition-colors hover:bg-[#145038]"
        >
          {submitted ? "Message Sent" : "Send Message"}

          <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}
