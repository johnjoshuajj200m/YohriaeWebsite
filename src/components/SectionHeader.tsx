import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && (
        <p
          className={`text-eyebrow ${centered ? "inline-flex items-center justify-center" : "eyebrow-line"}`}
        >
          <span>{eyebrow}</span>
        </p>
      )}
      <h2 className="mt-3">{title}</h2>
      {description && (
        <p
          className={`mt-4 text-base leading-relaxed text-muted-foreground sm:text-[1.0625rem] ${
            centered ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
