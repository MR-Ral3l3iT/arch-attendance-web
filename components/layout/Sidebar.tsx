"use client";

import Image from "next/image";
import Link from "next/link";
import logoArchd from "@/assets/logo-archd.png";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

interface SidebarProps {
  sections: NavSection[];
  appName?: string;
}

export function Sidebar({ sections, appName = "ARCHD Attendance" }: SidebarProps) {
  const pathname = usePathname();

  function isActive(item: NavItem) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  return (
    <aside className="flex flex-col w-60 shrink-0 h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100 shrink-0">
        <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-white ring-1 ring-gray-100">
          <Image
            src={logoArchd}
            alt=""
            fill
            sizes="32px"
            className="object-contain p-0.5"
            priority
          />
        </div>
        <span className="text-sm font-semibold text-gray-900 leading-tight">{appName}</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin space-y-5">
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="px-2 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-primary-50 text-primary"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <Icon
                        size={17}
                        className={cn(active ? "text-primary" : "text-gray-400")}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge != null && item.badge > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                      {active && <ChevronRight size={14} className="text-primary/50" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
