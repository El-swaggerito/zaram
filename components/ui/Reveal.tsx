"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type RevealDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "fade";

type RevealProps = {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  amount?: number;
  className?: string;
};

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 700,
  distance = 28,
  once = true,
  amount = 0.15,
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);

          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setVisible(false);
        }
      },
      {
        threshold: amount,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [amount, once]);

  const style = {
    "--reveal-delay": `${delay}ms`,
    "--reveal-duration": `${duration}ms`,
    "--reveal-distance": `${distance}px`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      style={style}
      data-reveal={direction}
      data-visible={visible ? "true" : "false"}
      className={className}
    >
      {children}
    </div>
  );
}
