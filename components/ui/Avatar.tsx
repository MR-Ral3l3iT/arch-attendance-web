import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const iconSizes: Record<AvatarSize, number> = {
  sm: 14,
  md: 18,
  lg: 22,
  xl: 28,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const base = cn(
    "rounded-full flex items-center justify-center overflow-hidden shrink-0 font-semibold",
    sizeClasses[size],
    className
  );

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name ?? "avatar"} className={cn(base, "object-cover")} />
    );
  }

  if (name) {
    return (
      <div className={cn(base, "bg-primary-100 text-primary-700")}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div className={cn(base, "bg-gray-100 text-gray-400")}>
      <User size={iconSizes[size]} />
    </div>
  );
}
