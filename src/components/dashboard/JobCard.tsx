import Link from "next/link";
import { MapPin, Briefcase, Users, Clock } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Button from "@/components/Button";
import type { Job } from "@/types";

interface JobCardProps {
  job: Job & { application_count?: number };
  onToggleStatus?: (id: string, currentStatus: string) => void;
  onDelete?: (id: string) => void;
}

export default function JobCard({
  job,
  onToggleStatus,
  onDelete,
}: JobCardProps) {
  const postedDate = new Date(job.created_at).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Job info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {job.title}
            </h3>
            <StatusBadge status={job.status} />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase size={12} />
              {job.job_type}
            </span>
            {job.salary_range && (
              <span className="flex items-center gap-1">
                ₦ {Number(job.salary_range).toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {postedDate}
            </span>
          </div>
        </div>

        {/* Application count */}
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1.5 text-gray-900">
            <Users size={14} />
            <span className="text-sm font-semibold">
              {job.application_count ?? 0}
            </span>
          </div>
          <span className="text-xs text-gray-400">applicants</span>
        </div>
      </div>

      {/* Description */}
      <div className="mt-2">
        <span className="text-sm text-gray-600">{job.description}</span>
      </div>
      {/* Description */}
      <div className="mt-2">
        <span className="text-xs text-gray-400">{job.requirements}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2 pt-4 border-t border-gray-50">
        <Link href={`/dashboard/jobs/${job.id}/applications`}>
          <Button variant="secondary" size="sm">
            View applications
          </Button>
        </Link>
        <Link href={`/dashboard/jobs/${job.id}/edit`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus?.(job.id, job.status)}
        >
          {job.status === "open" ? "Close job" : "Reopen job"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(job.id)}
          className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
