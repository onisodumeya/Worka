import Link from "next/link";
import Button from "@/components/Button";
import { LucideIcon } from "lucide-react";

interface ActionProps {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ActionProps;
}

export default function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {action && (
        <div className="shrink-0">
          {action.href ? (
            <Link href={action.href}>
              <Button size="md">
                {action.icon && <action.icon size={16} />}
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button size="md" onClick={action.onClick}>
              {action.icon && <action.icon size={16} />}
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
