"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import PageHeader from "@/components/dashboard/PageHeader";
import Button from "@/components/Button";
import type { Job, LookupItem } from "@/types";
import { Plus, X } from "lucide-react";

interface JobFormProps {
  jobTypes: LookupItem[];
  locations: LookupItem[];
  categories: LookupItem[];
  workModes: LookupItem[];
  job?: Job; // if provided, we're editing — if not, we're creating
}

interface FormData {
  title: string;
  location: string;
  job_type: string;
  work_mode: string;
  category: string;
  salary_range: string;
  description: string;
  requirements: string[];
}

export default function JobForm({
  jobTypes,
  locations,
  categories,
  workModes,
  job,
}: JobFormProps) {
  const router = useRouter();
  const isEditing = !!job;

  function toArray(value: string | string[] | undefined): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  const [requirements, setRequirements] = useState<string[]>(
    toArray(job?.requirements),
  );

  function addRequirement() {
    setRequirements((prev) => [...prev, ""]);
  }

  function updateRequirement(index: number, value: string) {
    setRequirements((prev) => prev.map((r, i) => (i === index ? value : r)));
  }

  function removeRequirement(index: number) {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  }

  const [form, setForm] = useState<FormData>({
    title: job?.title ?? "",
    location: job?.location ?? "",
    job_type: job?.job_type ?? "full-time",
    work_mode: job?.work_mode ?? "on-site",
    category: job?.category ?? "",
    salary_range: job?.salary_range ?? "",
    description: job?.description ?? "",
    requirements: toArray(job?.requirements),
  });
  const [loading, setLoading] = useState(false);

  function updateForm(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): string | null {
    if (!form.title.trim()) return "Job title is required";
    if (!form.location.trim()) return "Location is required";
    if (!form.job_type) return "Job type is required";
    if (!form.work_mode) return "Work mode is required";
    if (!form.category) return "Category is required";
    if (!form.description.trim()) return "Job description is required";
    if (!requirements.some((r) => r.trim()))
      return "At least one requirement is needed";
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (isEditing) {
      // Update existing job
      const { error: updateError } = await supabase
        .from("jobs")
        .update({
          title: form.title.trim(),
          location: form.location,
          job_type: form.job_type,
          work_mode: form.work_mode,
          category: form.category,
          salary_range: form.salary_range || null,
          description: form.description.trim(),
          requirements: requirements.filter((r) => r.trim()),
        })
        .eq("id", job.id);

      if (updateError) {
        toast.error("Failed to update job. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Job updated successfully!");
      router.push("/dashboard/jobs");
    } else {
      // Create new job
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", user.id)
        .single();

      const { error: insertError } = await supabase.from("jobs").insert({
        employer_id: user.id,
        company: profile?.company_name || "",
        title: form.title.trim(),
        location: form.location,
        job_type: form.job_type,
        work_mode: form.work_mode,
        category: form.category,
        salary_range: form.salary_range || null,
        description: form.description.trim(),
        requirements: requirements.filter((r) => r.trim()),
        status: "open",
      });

      if (insertError) {
        toast.error("Failed to post job. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Job posted successfully!");
      router.push("/dashboard/jobs");
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={isEditing ? "Edit job" : "Post a job"}
        description={
          isEditing
            ? "Update your job listing"
            : "Fill in the details below to create a new job listing"
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
        {/* Job title */}
        <div>
          <label className={labelClass}>
            Job title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            className={inputClass}
            placeholder="e.g. Senior Frontend Developer"
          />
        </div>

        {/* Job type + Work mode + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Job type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {jobTypes.map((type) => (
                <label
                  key={type.value}
                  className="relative flex cursor-pointer"
                >
                  <input
                    type="radio"
                    name="job_type"
                    value={type.value}
                    checked={form.job_type === type.value}
                    onChange={() => updateForm("job_type", type.value)}
                    className="peer sr-only"
                  />
                  <div className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs text-center capitalize peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white transition-all">
                    {type.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Work mode <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {workModes.map((mode) => (
                  <label
                    key={mode.value}
                    className="relative flex cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="work_mode"
                      value={mode.value}
                      checked={form.work_mode === mode.value}
                      onChange={() => updateForm("work_mode", mode.value)}
                      className="peer sr-only"
                    />
                    <div className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs text-center peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white transition-all">
                      {mode.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location + Salary */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Location <span className="text-red-400">*</span>
            </label>
            <select
              value={form.location}
              onChange={(e) => updateForm("location", e.target.value)}
              className={inputClass}
            >
              <option value="">Select location</option>
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Salary
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                ₦
              </span>
              <input
                type="text"
                value={form.salary_range}
                onChange={(e) => updateForm("salary_range", e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                placeholder="e.g. 800,000"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>
            Job description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            rows={6}
            placeholder="Describe the role, responsibilities, and what a typical day looks like..."
            className={`${inputClass} resize-none`}
          />
          <p className="mt-1 text-xs text-gray-400">
            {form.description.length} characters
          </p>
        </div>

        {/* Requirements */}
        <div>
          <label className={labelClass}>
            Requirements <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            {requirements.map((req, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="mt-2.5 text-gray-300 text-xs font-medium w-4 shrink-0">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(i, e.target.value)}
                  className={inputClass}
                  placeholder={`e.g. ${
                    i === 0
                      ? "3+ years of React experience"
                      : i === 1
                        ? "Strong TypeScript skills"
                        : "Requirement..."
                  }`}
                />
                {requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(i)}
                    className="mt-2 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mt-1"
            >
              <Plus size={15} /> Add requirement
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="min-w-30">
            {loading
              ? isEditing
                ? "Saving..."
                : "Posting..."
              : isEditing
                ? "Save changes"
                : "Post job"}
          </Button>
        </div>
      </div>
    </div>
  );
}
