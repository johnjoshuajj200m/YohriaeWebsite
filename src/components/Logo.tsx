import { Link } from "@tanstack/react-router";
import { logo } from "@/assets/images";

export function Logo({
  className = "",
  imageClassName = "h-11 w-auto sm:h-12 md:h-14 lg:h-16 xl:h-[4.375rem]",
}: {
  className?: string;
  imageClassName?: string;
}) {
  return (
    <Link
      to="/"
      className={`inline-flex shrink-0 items-center py-1 ${className}`}
      aria-label="YOHRIAE home"
    >
      <img
        src={logo}
        alt="YOHRIAE"
        width={220}
        height={88}
        className={`max-w-none object-contain object-left ${imageClassName}`}
        decoding="async"
      />
    </Link>
  );
}
