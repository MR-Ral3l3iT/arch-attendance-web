import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  className?: string;
}

export function PageHeader({ title, subtitle, icon, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mt-0.5">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1.5 mb-1">
              {breadcrumb.map((item, index) => (
                <span key={index} className="flex items-center gap-1.5">
                  {index > 0 && <span className="text-gray-300">/</span>}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-xs text-gray-500 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-xl font-semibold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
