"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast, Toaster } from "sonner";
import { FileText, ArrowLeft } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import ApplicationCard from "@/components/dashboard/ApplicationCard";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Button from "@/components/Button";
import type { Application, Job } from "@/types";

type FilterStatus = "all" | "pending" | "reviewed" | "shortlisted" | "rejected";

const filterTabs: { label: string; value: FilterStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Rejected", value: "rejected" },
];

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");

  // Fetch job details
  useEffect(() => {
    async function fetchJob() {
      const supabase = createClient();
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();
      setJob(data);
    }
    fetchJob();
  }, [id]);

  // Fetch applications for this job
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("applications")
      .select("*, profiles(full_name, avatar_url, bio, skills, resume_url)")
      .eq("job_id", id)
      .order("created_at", { ascending: false });

    if (activeFilter !== "all") {
      query = query.eq("status", activeFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to load applications");
      setLoading(false);
      return;
    }

    setApplications(data ?? []);
    setLoading(false);
  }, [id, activeFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleStatusChange(applicationId: string, status: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", applicationId);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? { ...app, status: status as Application["status"] }
          : app,
      ),
    );
    toast.success("Application status updated");
  }

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div>
      <Toaster position="top-center" richColors />

      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/jobs")}
        className="mb-6 -ml-2"
      >
        <ArrowLeft size={16} />
        Back to jobs
      </Button>

      {/* Job summary */}
      {job && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h2 className="text-sm font-semibold text-gray-900">
                {job.title}
              </h2>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-xs text-gray-400">
              {job.location} · {job.job_type} · {counts.all} application
              {counts.all !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/jobs/${id}/edit`)}
          >
            Edit job
          </Button>
        </div>
      )}

      <PageHeader
        title="Applications"
        description={`Reviewing applicants for ${job?.title ?? "this job"}`}
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-6 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === tab.value
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === tab.value
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Applications list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            activeFilter === "all"
              ? "No applications yet"
              : `No ${activeFilter} applications`
          }
          description={
            activeFilter === "all"
              ? "No one has applied to this job yet. Share it to get more visibility."
              : `No applications with ${activeFilter} status for this job.`
          }
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
