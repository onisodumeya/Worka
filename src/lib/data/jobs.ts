import { createClient } from "@/lib/supabase/server";

export async function getPublicJobs(filters?: {
  job_type?: string;
  location?: string;
  search?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("jobs")
    .select("*, profiles(company_name, logo_url, location)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (filters?.job_type) query = query.eq("job_type", filters.job_type);
  if (filters?.location)
    query = query.ilike("location", `%${filters.location}%`);
  if (filters?.search)
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    );

  const { data, error } = await query;
  if (error) return [];
  return data;
}

export async function getJobDetail(jobId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "*, profiles(company_name, logo_url, location, website_url, description, industry, company_size)",
    )
    .eq("id", jobId)
    .single();

  if (error) return null;
  return data;
}
