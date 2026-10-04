type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  light?: boolean;
  centred?: boolean;
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
  centred = false,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={[
        "max-w-2xl",
        centred ? "mx-auto text-center" : "",
        className,
      ].join(" ")}
    >
      {eyebrow && (
        <p
          className={[
            "mb-3 text-xs font-semibold uppercase tracking-[0.22em]",
            light
              ? "text-zaram-gold-400"
              : "text-zaram-gold-600",
          ].join(" ")}
        >
          {eyebrow}
        </p>
      )}

      <h2
        className={[
          "font-serif text-4xl leading-[1.08] md:text-5xl",
          light
            ? "text-zaram-ivory"
            : "text-zaram-green-900",
        ].join(" ")}
      >
        {title}
      </h2>

      {description && (
        <p
          className={[
            "mt-5 max-w-xl text-base leading-7",
            light
              ? "text-zaram-ivory/75"
              : "text-zaram-muted",
          ].join(" ")}
        >
          {description}
        </p>
      )}
    </div>
  );
}
