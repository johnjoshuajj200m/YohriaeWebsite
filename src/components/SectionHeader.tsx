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
      {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
      <h2 className={`mt-3 text-2xl font-bold tracking-tight sm:text-3xl ${centered ? "" : ""}`}>
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base leading-relaxed text-muted-foreground ${
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
