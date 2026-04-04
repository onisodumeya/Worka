import { useState } from "react";
import { FileText, ExternalLink, ChevronDown } from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Button from "@/components/Button";
import type { Application } from "@/types";

interface ApplicationCardProps {
  application: Application;
  onStatusChange?: (id: string, status: string) => void;
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
];

export default function ApplicationCard({
  application,
  onStatusChange,
}: ApplicationCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const appliedDate = new Date(application.created_at).toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
          {application.profiles?.avatar_url ? (
            <img
              src={application.profiles.avatar_url}
              alt={application.profiles.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-gray-500">
              {application.profiles?.full_name?.[0]?.toUpperCase()}
            </span>
          )}
        </div>

        {/* Applicant info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {application.profiles?.full_name}
            </h3>
            <StatusBadge status={application.status} />
          </div>

          {application.jobs?.title && (
            <p className="text-xs text-gray-400 mb-2">
              Applied for{" "}
              <span className="text-gray-600 font-medium">
                {application.jobs.title}
              </span>
            </p>
          )}

          {application.cover_letter && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
              {application.cover_letter}
            </p>
          )}

          <p className="text-xs text-gray-400 mt-2">Applied {appliedDate}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
        {/* View CV */}
        {application.resume_url && (
          <a
            href={application.resume_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="sm">
              <FileText size={14} />
              View CV
            </Button>
          </a>
        )}

        {/* View profile */}
        <a
          href={`/freelancers/${application.applicant_id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm">
            <ExternalLink size={14} />
            View profile
          </Button>
        </a>

        {/* Status dropdown */}
        <div className="relative ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDropdown((s) => !s)}
            className="flex items-center gap-1.5"
          >
            Update status
            <ChevronDown
              size={14}
              className={`transition-transform ${showDropdown ? "rotate-180" : ""}`}
            />
          </Button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-40 bg-white rounded-xl border border-gray-100 shadow-lg z-10 overflow-hidden">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onStatusChange?.(application.id, option.value);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                    application.status === option.value
                      ? "text-gray-900 font-medium bg-gray-50"
                      : "text-gray-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
