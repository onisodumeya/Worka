import { getLookups } from "@/lib/data/lookups";
import JobForm from "@/components/dashboard/JobForm";

export default async function PostJobPage() {
  const { workModes, jobTypes, locations, categories } = await getLookups();

  return (
    <JobForm
      workModes={workModes}
      jobTypes={jobTypes}
      locations={locations}
      categories={categories}
    />
  );
}
