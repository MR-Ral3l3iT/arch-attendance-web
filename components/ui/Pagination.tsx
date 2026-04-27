"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safePage = Math.min(Math.max(page, 1), safeTotalPages);
  const from = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const to = total === 0 ? 0 : Math.min(safePage * limit, total);

  const pages = buildPageList(safePage, safeTotalPages);

  return (
    <div className={cn("flex items-center justify-between gap-4 text-sm", className)}>
      <p className="text-gray-500">
        แสดง <span className="font-medium text-gray-700">{from}–{to}</span> จาก{" "}
        <span className="font-medium text-gray-700">{total}</span> รายการ
      </p>
      <div className="flex items-center gap-1">
        <PageButton
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeft size={16} />
        </PageButton>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <PageButton
              key={p}
              onClick={() => onPageChange(Number(p))}
              active={p === safePage}
            >
              {p}
            </PageButton>
          )
        )}
        <PageButton
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safeTotalPages}
          aria-label="หน้าถัดไป"
        >
          <ChevronRight size={16} />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  ...props
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
} & React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active
          ? "bg-primary text-white"
          : "text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function buildPageList(page: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (page > 3) pages.push("...");
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) {
    pages.push(i);
  }
  if (page < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
