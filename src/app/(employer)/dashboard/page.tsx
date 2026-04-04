import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getEmployerProfile,
  getEmployerJobs,
  getEmployerApplications,
  getEmployerStats,
} from "@/lib/data/employer";
import {
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Plus,
  ArrowRight,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import EmptyState from "@/components/dashboard/EmptyState";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, jobs, applications, stats] = await Promise.all([
    getEmployerProfile(user.id),
    getEmployerJobs(user.id),
    getEmployerApplications(user.id, 5),
    getEmployerStats(user.id),
  ]);

  // Get first name for greeting
  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      {/* Onboarding banner */}
      {!profile?.employer_onboarding_complete && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-900">
              Complete your company profile
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Complete your profile so candidates know who you are.
            </p>
          </div>
          <Link
            href="/employer-onboarding"
            className="shrink-0 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete profile
          </Link>
        </div>
      )}

      {/* Page header */}
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's what's happening with your jobs today"
        action={{
          label: "Post a job",
          href: "/dashboard/jobs/new",
          icon: Plus,
        }}
      />

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total jobs"
          value={stats?.totalJobs}
          icon={Briefcase}
          color="blue"
        />
        <StatsCard
          label="Total applications"
          value={stats?.totalApplications}
          icon={FileText}
          color="purple"
        />
        <StatsCard
          label="Open jobs"
          value={stats?.openJobs}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          label="Closed jobs"
          value={stats?.closedJobs}
          icon={XCircle}
          color="gray"
        />
      </div>

      {/* Application status breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          Applications by status
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Pending",
              value: stats?.pending,
              icon: Clock,
              color: "yellow" as const,
            },
            {
              label: "Shortlisted",
              value: stats?.shortlisted,
              icon: Star,
              color: "blue" as const,
            },
            {
              label: "Rejected",
              value: stats?.rejected,
              icon: XCircle,
              color: "red" as const,
            },
          ].map((stat) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      </div>

      {/* Recent applications */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent applications
          </h2>
          <Link
            href="/dashboard/applications"
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {!applications?.length ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Applications will appear here once candidates apply to your jobs."
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {applications.map((app) => (
              <div
                key={app.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                    {app.profiles?.avatar_url ? (
                      <img
                        src={app.profiles.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-500">
                        {app.profiles?.full_name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {app.profiles?.full_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {app.jobs?.title}
                    </p>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent jobs */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Your jobs</h2>
          <Link
            href="/dashboard/jobs"
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {!jobs?.length ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs posted yet"
            description="Post your first job and start receiving applications."
            action={{ label: "Post a job", href: "/dashboard/jobs/new" }}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {job.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {job.applications?.[0]?.count ?? 0} application(s) ·{" "}
                    {job.job_type}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={job.status} />
                  <Link
                    href={`/dashboard/jobs/${job.id}/edit`}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
