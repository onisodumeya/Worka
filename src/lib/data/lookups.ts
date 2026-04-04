import { createClient } from "@/lib/supabase/server";

export async function getLookups() {
  const supabase = await createClient();

  const [workModes, jobTypes, locations, categories] = await Promise.all([
    supabase.from("work_modes").select("value, label").order("sort_order"),
    supabase.from("job_types").select("value, label").order("sort_order"),
    supabase.from("locations").select("value, label").order("sort_order"),
    supabase.from("job_categories").select("value, label").order("sort_order"),
  ]);

  return {
    workModes: workModes.data ?? [],
    jobTypes: jobTypes.data ?? [],
    locations: locations.data ?? [],
    categories: categories.data ?? [],
  };
}
