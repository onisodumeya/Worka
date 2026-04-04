type JobStatus = "open" | "closed";
type ApplicationStatus = "pending" | "reviewed" | "shortlisted" | "rejected";
type Status = JobStatus | ApplicationStatus;

const statusConfig: Record<Status, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-green-50 text-green-700" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-500" },
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-700" },
  reviewed: { label: "Reviewed", className: "bg-purple-50 text-purple-700" },
  shortlisted: { label: "Shortlisted", className: "bg-blue-50 text-blue-700" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-600" },
};

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
