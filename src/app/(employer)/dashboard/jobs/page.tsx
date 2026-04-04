"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast, Toaster } from "sonner";
import { Briefcase, Plus } from "lucide-react";
import JobCard from "@/components/dashboard/JobCard";
import EmptyState from "@/components/dashboard/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import ConfirmModal from "@/components/ConfirmModal";
import type { Job } from "@/types";

interface PendingAction {
  type: "delete" | "toggle";
  id: string;
  currentStatus?: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<(Job & { application_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const fetchJobs = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("jobs")
      .select("*, applications(count)")
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load jobs");
      return;
    }

    setJobs(
      data.map((job) => ({
        ...job,
        application_count: job.applications?.[0]?.count ?? 0,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  async function handleConfirm() {
    if (!pendingAction) return;
    setActionLoading(true);
    const supabase = createClient();

    if (pendingAction.type === "delete") {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", pendingAction.id);

      if (error) {
        toast.error("Failed to delete job");
      } else {
        setJobs((prev) => prev.filter((j) => j.id !== pendingAction.id));
        toast.success("Job deleted successfully");
      }
    }

    if (pendingAction.type === "toggle") {
      const newStatus =
        pendingAction.currentStatus === "open" ? "closed" : "open";
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", pendingAction.id);

      if (error) {
        toast.error("Failed to update job status");
      } else {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === pendingAction.id ? { ...j, status: newStatus } : j,
          ),
        );
        toast.success(
          `Job ${newStatus === "open" ? "reopened" : "closed"} successfully`,
        );
      }
    }

    setActionLoading(false);
    setPendingAction(null);
  }

  const modalConfig = {
    delete: {
      title: "Delete this job?",
      description:
        "This will permanently delete the job listing and all its applications. This action cannot be undone.",
      confirmLabel: "Delete job",
      variant: "danger" as const,
    },
    toggle: {
      title:
        pendingAction?.currentStatus === "open"
          ? "Close this job?"
          : "Reopen this job?",
      description:
        pendingAction?.currentStatus === "open"
          ? "Closing this job will hide it from the public board and stop new applications."
          : "Reopening this job will make it visible on the public board again.",
      confirmLabel:
        pendingAction?.currentStatus === "open" ? "Close job" : "Reopen job",
      variant: "warning" as const,
    },
  };

  const currentModal = pendingAction ? modalConfig[pendingAction.type] : null;

  return (
    <div>
      <Toaster position="top-center" richColors />

      <PageHeader
        title="Jobs"
        description="Manage your job postings"
        action={{
          label: "Post a job",
          href: "/dashboard/jobs/new",
          icon: Plus,
        }}
      />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-8 bg-gray-100 rounded w-16" />
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <div className="h-8 bg-gray-100 rounded w-32" />
                <div className="h-8 bg-gray-100 rounded w-16" />
                <div className="h-8 bg-gray-100 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Post your first job and start receiving applications from talented freelancers."
          action={{ label: "Post a job", href: "/dashboard/jobs/new" }}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onToggleStatus={(id, currentStatus) =>
                setPendingAction({ type: "toggle", id, currentStatus })
              }
              onDelete={(id) => setPendingAction({ type: "delete", id })}
            />
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {currentModal && (
        <ConfirmModal
          isOpen={!!pendingAction}
          title={currentModal.title}
          description={currentModal.description}
          confirmLabel={currentModal.confirmLabel}
          variant={currentModal.variant}
          loading={actionLoading}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
