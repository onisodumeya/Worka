import { getLookups } from "@/lib/data/lookups";
import { getJobById } from "@/lib/data/employer";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import JobForm from "@/components/dashboard/JobForm";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [job, { jobTypes, locations, categories, workModes }] =
    await Promise.all([getJobById(id), getLookups()]);

  // Job not found or doesn't belong to this employer
  if (!job || job.employer_id !== user.id) notFound();

  return (
    <JobForm
      job={job}
      jobTypes={jobTypes}
      locations={locations}
      categories={categories}
      workModes={workModes}
    />
  );
}
