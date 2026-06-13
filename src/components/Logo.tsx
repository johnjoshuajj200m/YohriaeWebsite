import logo from "@/assets/yohriae-logo.png.asset.json";
import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="YOHRIAE home">
      <img
        src={logo.url}
        alt="YOHRIAE"
        width={48}
        height={48}
        className="h-10 w-10 object-contain"
      />
      <span className="font-display text-lg tracking-tight text-brand-ink">YOHRIAE</span>
    </Link>
  );
}
