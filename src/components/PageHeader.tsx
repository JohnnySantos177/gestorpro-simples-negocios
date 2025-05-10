
import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  className,
  actions,
}) => {
  return (
    <div className={cn("mb-8 flex flex-col sm:flex-row justify-between items-start", className)}>
      <div className="flex items-center gap-2">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">{title}</h1>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="mt-4 sm:mt-0 flex-shrink-0">{actions}</div>}
    </div>
  );
};
