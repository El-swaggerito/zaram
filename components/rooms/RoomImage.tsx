"use client";

import { useState } from "react";

type RoomImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function RoomImage({
  src,
  alt,
  className = "",
}: RoomImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={[
          "flex h-full w-full items-center justify-center bg-[#DDD5C8]",
          className,
        ].join(" ")}
      >
        <div className="text-center">
          <div className="mx-auto mb-3 h-px w-12 bg-[#C89D35]" />

          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0B4A32]/50">
            {alt}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={[
        "h-full w-full object-cover",
        className,
      ].join(" ")}
    />
  );
}
