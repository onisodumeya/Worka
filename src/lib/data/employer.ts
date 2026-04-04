import { createClient } from "@/lib/supabase/server";

export async function getEmployerProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "full_name, company_name, employer_onboarding_complete, logo_url, industry, location, website_url, email",
    )
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function getEmployerJobs(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, applications(count)")
    .eq("employer_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data.map((job) => ({
    ...job,
    application_count: job.applications?.[0]?.count ?? 0,
  }));
}

export async function getEmployerApplications(userId: string, limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("applications")
    .select(
      "*, jobs!inner(employer_id, title, company), profiles(full_name, avatar_url)",
    )
    .eq("jobs.employer_id", userId)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function getEmployerStats(userId: string) {
  const [jobs, applications] = await Promise.all([
    getEmployerJobs(userId),
    getEmployerApplications(userId),
  ]);

  return {
    totalJobs: jobs.length,
    openJobs: jobs.filter((j) => j.status === "open").length,
    closedJobs: jobs.filter((j) => j.status === "closed").length,
    totalApplications: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    reviewed: applications.filter((a) => a.status === "reviewed").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };
}

export async function getJobById(jobId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select("*, applications(count)")
    .eq("id", jobId)
    .single();

  if (error) return null;
  return {
    ...data,
    application_count: data.applications?.[0]?.count ?? 0,
  };
}

export async function getJobApplications(jobId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*, profiles(full_name, avatar_url, bio, skills, resume_url)")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
