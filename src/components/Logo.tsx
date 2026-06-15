import { Link } from "@tanstack/react-router";
import { logo } from "@/assets/logo";

export function Logo({
  className = "",
  imageClassName = "h-[3.25rem] w-auto sm:h-14 lg:h-[3.75rem]",
}: {
  className?: string;
  imageClassName?: string;
}) {
  return (
    <Link
      to="/"
      className={`inline-flex shrink-0 items-center py-1.5 ${className}`}
      aria-label="YOHRIAE home"
    >
      <img
        src={logo}
        alt="YOHRIAE"
        width={240}
        height={96}
        className={`max-w-none object-contain object-left ${imageClassName}`}
        decoding="async"
      />
    </Link>
  );
}
