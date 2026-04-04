"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  ExternalLink,
  Globe,
} from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Button from "@/components/Button";
import { Toaster, toast } from "sonner";
import type { Job, LookupItem } from "@/types";
import Pagination from "@/components/Pagination";

interface JobWithProfile extends Job {
  profiles: {
    company_name: string;
    logo_url?: string;
    location?: string;
    industry?: string;
    company_size?: string;
    description?: string;
    website_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
  };
}

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<JobWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobWithProfile | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Lookups
  const [jobTypes, setJobTypes] = useState<LookupItem[]>([]);
  const [workModes, setWorkModes] = useState<LookupItem[]>([]);
  const [locations, setLocations] = useState<LookupItem[]>([]);
  const [categories, setCategories] = useState<LookupItem[]>([]);

  // Fetch lookups
  useEffect(() => {
    async function fetchLookups() {
      const supabase = createClient();
      const [jt, wm, loc, cat] = await Promise.all([
        supabase.from("job_types").select("value, label").order("sort_order"),
        supabase.from("work_modes").select("value, label").order("sort_order"),
        supabase.from("locations").select("value, label").order("sort_order"),
        supabase
          .from("job_categories")
          .select("value, label")
          .order("sort_order"),
      ]);
      setJobTypes(jt.data ?? []);
      setWorkModes(wm.data ?? []);
      setLocations(loc.data ?? []);
      setCategories(cat.data ?? []);
    }
    fetchLookups();
  }, []);

  // Fetch jobs
  const JOBS_PER_PAGE = 10;

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const from = (page - 1) * JOBS_PER_PAGE;
    const to = from + JOBS_PER_PAGE - 1;

    let query = supabase
      .from("jobs")
      .select(
        `
    *,
    profiles(
      company_name,
      logo_url,
      location,
      industry,
      company_size,
      description,
      website_url,
      linkedin_url,
      twitter_url
    )
  `,
      )
      .eq("status", "open");

    if (search)
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    if (jobType) query = query.eq("job_type", jobType);
    if (workMode) query = query.eq("work_mode", workMode);
    if (location) query = query.eq("location", location);
    if (category) query = query.eq("category", category);

    query = query.order("created_at", { ascending: sortBy === "oldest" });

    const { data, error, count } = await query;

    if (error) {
      toast.error("Failed to load jobs");
      setLoading(false);
      return;
    }

    setJobs(data ?? []);
    setTotalCount(count ?? 0);
    setLoading(false);
  }, [search, jobType, workMode, location, category, sortBy, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    setPage(1);
  }, [search, jobType, workMode, location, category, sortBy]);

  // Check if user has applied to selected job
  useEffect(() => {
    async function checkApplication() {
      if (!selectedJob) return;
      setCheckingApplication(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCheckingApplication(false);
        return;
      }

      const { data } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", selectedJob.id)
        .eq("applicant_id", user.id)
        .single();

      setHasApplied(!!data);
      setCheckingApplication(false);
    }
    checkApplication();
  }, [selectedJob]);

  async function applyForJob(job: any) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login`);
    } else {
      router.push(`/${job.id}/apply`);
    }
  }

  function clearFilters() {
    setSearch("");
    setJobType("");
    setWorkMode("");
    setLocation("");
    setCategory("");
    setSortBy("newest");
  }

  const hasActiveFilters =
    search || jobType || workMode || location || category;

  const postedDate = (date: string) =>
    new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div>
      <Toaster position="top-center" richColors />

      {/* Search + filter bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title or keyword..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters((s) => !s)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-gray-900" />
            )}
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="">All job types</option>
              {jobTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="">All work modes</option>
              {workModes.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="">All locations</option>
              {locations.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors col-span-2 md:col-span-4"
              >
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left — job listings + pagination */}
        <div className="w-full lg:w-1/2 shrink-0 space-y-3">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Briefcase size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900">No jobs found</p>
              <p className="text-xs text-gray-400 mt-1">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "Check back soon for new opportunities"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-gray-600 font-medium hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left bg-white rounded-xl border p-5 hover:border-gray-300 transition-all ${
                    selectedJob?.id === job.id
                      ? "border-gray-900 shadow-sm"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                      {job.profiles?.logo_url ? (
                        <img
                          src={job.profiles.logo_url}
                          alt={job.profiles.company_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {job.profiles?.company_name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={11} /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Briefcase size={11} /> {job.job_type}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={11} /> {postedDate(job.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              <Pagination
                currentPage={page}
                totalCount={totalCount}
                perPage={JOBS_PER_PAGE}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </>
          )}
        </div>

        {/* Right — permanent detail panel (desktop) */}
        <div className="hidden lg:flex flex-1 sticky top-20 max-h-[calc(100vh-6rem)] w-1/2 bg-white rounded-xl border border-gray-100 overflow-hidden flex-col h-[80vh] overflow-y-auto">
          {selectedJob ? (
            <>
              {/* Panel header */}
              <div className="flex items-start gap-3 p-6 border-b border-gray-100">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-gray-900">
                    {selectedJob.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedJob.profiles?.company_name}
                  </p>
                </div>
              </div>

              {/* Job meta */}
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                  <MapPin size={12} /> {selectedJob.location}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                  <Briefcase size={12} /> {selectedJob.job_type}
                </span>
                {selectedJob.work_mode && (
                  <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg capitalize">
                    {selectedJob.work_mode}
                  </span>
                )}
                {selectedJob.salary_range && (
                  <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                    ₦{selectedJob.salary_range}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                  <Clock size={12} /> {postedDate(selectedJob.created_at)}
                </span>
              </div>

              {/* Company info */}
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  About the company
                </h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                    {selectedJob.profiles?.logo_url ? (
                      <img
                        src={selectedJob.profiles.logo_url}
                        alt={selectedJob.profiles.company_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedJob.profiles?.company_name}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedJob.profiles?.industry && (
                        <span className="text-xs text-gray-400 capitalize">
                          {selectedJob.profiles.industry}
                        </span>
                      )}
                      {selectedJob.profiles?.company_size && (
                        <>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">
                            {selectedJob.profiles.company_size} employees
                          </span>
                        </>
                      )}
                      {selectedJob.profiles?.location && (
                        <>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">
                            {selectedJob.profiles.location}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedJob.profiles?.description && (
                  <p className="text-sm text-gray-500 leading-relaxed mt-3 line-clamp-3">
                    {selectedJob.profiles.description}
                  </p>
                )}

                {/* Social links */}
                {(selectedJob.profiles?.website_url ||
                  selectedJob.profiles?.linkedin_url ||
                  selectedJob.profiles?.twitter_url) && (
                  <div className="flex items-center gap-3 mt-3">
                    {selectedJob.profiles?.website_url && (
                      <a
                        href={selectedJob.profiles.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                      >
                        <Globe size={12} /> Website
                      </a>
                    )}
                    {selectedJob.profiles?.linkedin_url && (
                      <a
                        href={`https://linkedin.com/company/${selectedJob.profiles.linkedin_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink size={12} /> LinkedIn
                      </a>
                    )}
                    {selectedJob.profiles?.twitter_url && (
                      <a
                        href={`https://x.com/${selectedJob.profiles.twitter_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink size={12} /> Twitter
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Scrollable content */}
              <div className="flex-1 px-6 py-5 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    About the role
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Requirements
                  </h3>
                  {selectedJob.requirements.map((requirement, index) => (
                    <p
                      key={index}
                      className="text-sm text-gray-600 leading-relaxed whitespace-pre-line"
                    >
                      - {requirement}
                    </p>
                  ))}
                </div>
              </div>

              {/* Apply button */}
              <div className="border-t border-gray-100 px-6 py-4">
                {checkingApplication ? (
                  <Button className="w-full" disabled>
                    Checking...
                  </Button>
                ) : hasApplied ? (
                  <Button className="w-full" variant="secondary" disabled>
                    Already applied
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => applyForJob(selectedJob)}
                  >
                    Apply for this role
                  </Button>
                )}
              </div>
            </>
          ) : (
            // Empty state when no job is selected
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Briefcase size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900">Select a job</p>
              <p className="text-xs text-gray-400 mt-1 max-w-45 leading-relaxed">
                Click on any listing to see the full details here
              </p>
            </div>
          )}
        </div>

        {/* Mobile — full screen overlay */}
        {selectedJob && (
          <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col">
            {/* Mobile header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X size={18} /> Back to jobs
              </button>
            </div>

            {/* Company header */}
            <div className="flex items-start gap-3 p-5 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 shrink-0">
                {selectedJob.profiles?.logo_url ? (
                  <img
                    src={selectedJob.profiles.logo_url}
                    alt={selectedJob.profiles.company_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 size={20} className="text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {selectedJob.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedJob.profiles?.company_name}
                </p>
              </div>
            </div>

            {/* Job meta */}
            <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <MapPin size={12} /> {selectedJob.location}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <Briefcase size={12} /> {selectedJob.job_type}
              </span>
              {selectedJob.work_mode && (
                <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg capitalize">
                  {selectedJob.work_mode}
                </span>
              )}
              {selectedJob.salary_range && (
                <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                  ₦{selectedJob.salary_range}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                <Clock size={12} /> {postedDate(selectedJob.created_at)}
              </span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  About the role
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Requirements
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {selectedJob.requirements}
                </p>
              </div>
            </div>

            {/* Apply button */}
            <div className="border-t border-gray-100 px-5 py-4">
              {checkingApplication ? (
                <Button className="w-full" disabled>
                  Checking...
                </Button>
              ) : hasApplied ? (
                <Button className="w-full" variant="secondary" disabled>
                  Already applied
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => router.push(`/${selectedJob.id}/apply`)}
                >
                  Apply for this role
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
