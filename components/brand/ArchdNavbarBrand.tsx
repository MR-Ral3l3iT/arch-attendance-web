import Image from "next/image";
import Link from "next/link";
import logoArchd from "@/assets/logo-archd.png";

type Props = {
  /** Localized tagline under the wordmark, e.g. ระบบบันทึกการเข้าเรียน */
  subtitle: string;
  href: string;
};

/** Matches the login card branding: mark + ARCHD / Attendance + subtitle */
export function ArchdNavbarBrand({ subtitle, href }: Props) {
  return (
    <Link
      href={href}
      aria-label="ARCHD Attendance"
      className="flex items-center gap-3 rounded-xl outline-none ring-offset-2 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-gray-100">
        <Image
          src={logoArchd}
          alt=""
          fill
          sizes="40px"
          className="object-contain p-1"
          priority
        />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-base font-bold tracking-tight">
          <span className="text-primary">ARCHD</span>{" "}
          <span className="text-gray-900">Attendance</span>
        </p>
        <p className="truncate text-xs text-gray-500">{subtitle}</p>
      </div>
    </Link>
  );
}
