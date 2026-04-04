import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "purple" | "green" | "gray" | "yellow" | "red";
}

const colorConfig = {
  blue: {
    card: "bg-blue-50 border border-blue-200",
    icon: "bg-blue-100 text-blue-600",
  },
  purple: {
    card: "bg-purple-50 border border-purple-200",
    icon: "bg-purple-100 text-purple-600",
  },
  green: {
    card: "bg-green-50 border border-green-200",
    icon: "bg-green-100 text-green-600",
  },
  gray: {
    card: "bg-gray-100 border border-gray-200",
    icon: "bg-gray-100 text-gray-600",
  },
  yellow: {
    card: "bg-yellow-50 border border-yellow-200",
    icon: "bg-yellow-100 text-yellow-600",
  },
  red: {
    card: "bg-red-50 border border-red-200",
    icon: "bg-red-100 text-red-500",
  },
};

export default function StatsCard({
  label,
  value,
  icon: Icon,
  color,
}: StatsCardProps) {
  const config = colorConfig[color];

  return (
    <div className={`rounded-xl p-5 ${config.card}`}>
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.icon}`}
        >
          <Icon size={18} />
        </div>
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
