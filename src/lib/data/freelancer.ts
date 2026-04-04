import { createClient } from "@/lib/supabase/server";

export async function getFreelancerProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, experiences(*), education(*), certifications(*)")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function getFreelancerApplications(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*, jobs(title, company, location, job_type, status)")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
