"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Toaster } from "sonner";
import {
  User,
  Briefcase,
  GraduationCap,
  Star,
  FileText,
  Eye,
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
} from "lucide-react";
import Button from "@/components/Button";

const STEPS = [
  { id: 1, label: "Basic info", icon: User },
  { id: 2, label: "Experience", icon: Briefcase },
  { id: 3, label: "Education", icon: GraduationCap },
  { id: 4, label: "Skills", icon: Star },
  { id: 5, label: "CV & Portfolio", icon: FileText },
  { id: 6, label: "Review", icon: Eye },
];

interface ExperienceEntry {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string;
}

interface EducationEntry {
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  current: boolean;
}

interface CertificationEntry {
  name: string;
  issuer: string;
  year: string;
  url: string;
}

const emptyExperience: ExperienceEntry = {
  company: "",
  role: "",
  start_date: "",
  end_date: "",
  current: false,
  description: "",
};

const emptyEducation: EducationEntry = {
  institution: "",
  degree: "",
  field_of_study: "",
  start_year: "",
  end_year: "",
  current: false,
};

const emptyCertification: CertificationEntry = {
  name: "",
  issuer: "",
  year: "",
  url: "",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);

  // Step 1
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bio, setBio] = useState("");

  // Step 2
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([
    { ...emptyExperience },
  ]);

  // Step 3
  const [educations, setEducations] = useState<EducationEntry[]>([
    { ...emptyEducation },
  ]);

  // Step 4
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [certifications, setCertifications] = useState<CertificationEntry[]>([
    { ...emptyCertification },
  ]);

  // Step 5
  const [cv, setCv] = useState<File | null>(null);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([""]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function updateExperience(
    index: number,
    field: keyof ExperienceEntry,
    value: string | boolean,
  ) {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  }

  function updateEducation(
    index: number,
    field: keyof EducationEntry,
    value: string | boolean,
  ) {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  }

  function updateCertification(
    index: number,
    field: keyof CertificationEntry,
    value: string,
  ) {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  }

  function updatePortfolioLink(index: number, value: string) {
    const updated = [...portfolioLinks];
    updated[index] = value;
    setPortfolioLinks(updated);
  }

  async function handleFinish() {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      toast.loading("Uploading files...", { id: "saving" });

      let avatar_url = "";
      if (avatar) {
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(`${user.id}/avatar`, avatar, { upsert: true });
        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(data.path);
          avatar_url = urlData.publicUrl;
        }
      }

      let resume_url = "";
      if (cv) {
        const { data, error } = await supabase.storage
          .from("resumes")
          .upload(`${user.id}/cv`, cv, { upsert: true });
        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from("resumes")
            .getPublicUrl(data.path);
          resume_url = urlData.publicUrl;
        }
      }

      toast.loading("Saving your profile...", { id: "saving" });

      await supabase
        .from("profiles")
        .update({
          bio,
          avatar_url: avatar_url || undefined,
          resume_url: resume_url || undefined,
          skills,
          portfolio_links: portfolioLinks.filter((l) => l.trim()),
          onboarding_complete: true,
        })
        .eq("id", user.id);

      const validExperiences = experiences.filter((e) => e.company && e.role);
      if (validExperiences.length) {
        await supabase
          .from("experiences")
          .insert(validExperiences.map((e) => ({ ...e, profile_id: user.id })));
      }

      const validEducation = educations.filter(
        (e) => e.institution && e.degree,
      );
      if (validEducation.length) {
        await supabase
          .from("education")
          .insert(validEducation.map((e) => ({ ...e, profile_id: user.id })));
      }

      const validCerts = certifications.filter((c) => c.name && c.issuer);
      if (validCerts.length) {
        await supabase
          .from("certifications")
          .insert(validCerts.map((c) => ({ ...c, profile_id: user.id })));
      }

      toast.success("Profile complete!", { id: "saving" });
      router.push("/jobs");
    } catch {
      toast.error("Something went wrong. Please try again.", { id: "saving" });
      setSaving(false);
    }
  }

  async function handleSkip() {
    setSkipping(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ onboarding_complete: true })
        .eq("id", user.id);
    }
    router.push("/jobs");
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-sm md:text-lg font-semibold text-gray-900">
            Complete your profile
          </h1>

          <Button
            variant="ghost"
            click={handleSkip}
            loading={skipping || saving}
            className="w-fit"
          >
            {skipping ? "skipping..." : "Skip for now"}
          </Button>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 hidden md:block">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isComplete = step > s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isComplete
                          ? "bg-gray-900 text-white"
                          : isCurrent
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <span
                      className={`text-xs hidden sm:block ${
                        isCurrent
                          ? "text-gray-900 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-px w-8 sm:w-16 mx-1 md:mb-4 transition-all ${
                        step > s.id ? "bg-gray-900" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-8">
          {/* Step 1: Basic info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Basic information
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Let employers know who you are
                </p>
              </div>

              {/* Avatar upload */}
              <div>
                <label className={labelClass}>Profile photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    {avatarPreview ? "Change photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className={labelClass}>Bio & summary</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  placeholder="Tell employers about yourself, your background, and what you're looking for..."
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-1 text-xs text-gray-400">
                  {bio.length}/500 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Work experience
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Add your most recent roles first
                </p>
              </div>

              {experiences.map((exp, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-100 rounded-xl space-y-3 relative"
                >
                  {experiences.length > 1 && (
                    <button
                      onClick={() =>
                        setExperiences(
                          experiences.filter((_, idx) => idx !== i),
                        )
                      }
                      className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Company</label>
                      <input
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(i, "company", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Acme Ltd."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Role</label>
                      <input
                        value={exp.role}
                        onChange={(e) =>
                          updateExperience(i, "role", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Frontend Developer"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Start date</label>
                      <input
                        type="month"
                        value={exp.start_date}
                        onChange={(e) =>
                          updateExperience(i, "start_date", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End date</label>
                      <input
                        type="month"
                        value={exp.end_date}
                        onChange={(e) =>
                          updateExperience(i, "end_date", e.target.value)
                        }
                        className={inputClass}
                        disabled={exp.current}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) =>
                        updateExperience(i, "current", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    I currently work here
                  </label>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) =>
                        updateExperience(i, "description", e.target.value)
                      }
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() =>
                  setExperiences([...experiences, { ...emptyExperience }])
                }
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Plus size={16} /> Add another role
              </button>
            </div>
          )}

          {/* Step 3: Education */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Education
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your academic background
                </p>
              </div>

              {educations.map((edu, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-100 rounded-xl space-y-3 relative"
                >
                  {educations.length > 1 && (
                    <button
                      onClick={() =>
                        setEducations(educations.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div>
                    <label className={labelClass}>Institution</label>
                    <input
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(i, "institution", e.target.value)
                      }
                      className={inputClass}
                      placeholder="University of Lagos"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Degree</label>
                      <input
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(i, "degree", e.target.value)
                        }
                        className={inputClass}
                        placeholder="B.Sc Computer Science"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Field of study</label>
                      <input
                        value={edu.field_of_study}
                        onChange={(e) =>
                          updateEducation(i, "field_of_study", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Start year</label>
                      <input
                        type="number"
                        min="1980"
                        max="2030"
                        value={edu.start_year}
                        onChange={(e) =>
                          updateEducation(i, "start_year", e.target.value)
                        }
                        className={inputClass}
                        placeholder="2018"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End year</label>
                      <input
                        type="number"
                        min="1980"
                        max="2030"
                        value={edu.end_year}
                        onChange={(e) =>
                          updateEducation(i, "end_year", e.target.value)
                        }
                        className={`${inputClass} ${edu.current ? "opacity-40 cursor-not-allowed bg-gray-50" : ""}`}
                        placeholder={edu.current ? "Present" : "2022"}
                        disabled={edu.current}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={edu.current}
                      onChange={(e) =>
                        updateEducation(i, "current", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    I am currently studying here
                  </label>
                </div>
              ))}

              <button
                onClick={() =>
                  setEducations([...educations, { ...emptyEducation }])
                }
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Plus size={16} /> Add another institution
              </button>
            </div>
          )}

          {/* Step 4: Skills & Certifications */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Skills & certifications
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Highlight what you're good at
                </p>
              </div>

              {/* Skills */}
              <div>
                <label className={labelClass}>Skills</label>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className={inputClass}
                    placeholder="e.g. React, TypeScript, Figma"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div>
                <label className={labelClass}>Certifications</label>
                <div className="space-y-3">
                  {certifications.map((cert, i) => (
                    <div
                      key={i}
                      className="p-4 border border-gray-100 rounded-xl space-y-3 relative"
                    >
                      {certifications.length > 1 && (
                        <button
                          onClick={() =>
                            setCertifications(
                              certifications.filter((_, idx) => idx !== i),
                            )
                          }
                          className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Certificate name</label>
                          <input
                            value={cert.name}
                            onChange={(e) =>
                              updateCertification(i, "name", e.target.value)
                            }
                            className={inputClass}
                            placeholder="AWS Solutions Architect"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            Issuing organization
                          </label>
                          <input
                            value={cert.issuer}
                            onChange={(e) =>
                              updateCertification(i, "issuer", e.target.value)
                            }
                            className={inputClass}
                            placeholder="Amazon Web Services"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Year</label>
                          <input
                            type="number"
                            min="1980"
                            max="2030"
                            value={cert.year}
                            onChange={(e) =>
                              updateCertification(i, "year", e.target.value)
                            }
                            className={inputClass}
                            placeholder="2023"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Certificate URL</label>
                          <input
                            value={cert.url}
                            onChange={(e) =>
                              updateCertification(i, "url", e.target.value)
                            }
                            className={inputClass}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setCertifications([
                        ...certifications,
                        { ...emptyCertification },
                      ])
                    }
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Plus size={16} /> Add another certification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: CV & Portfolio */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  CV & portfolio
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Share your work and resume
                </p>
              </div>

              {/* CV upload */}
              <div>
                <label className={labelClass}>Upload CV</label>
                <label
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${cv ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText
                      size={24}
                      className={cv ? "text-gray-900" : "text-gray-400"}
                    />
                    <span className="text-sm text-gray-600">
                      {cv ? cv.name : "Click to upload your CV"}
                    </span>
                    <span className="text-xs text-gray-400">
                      PDF, DOC up to 5MB
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCv(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Portfolio links */}
              <div>
                <label className={labelClass}>Portfolio links</label>
                <div className="space-y-2">
                  {portfolioLinks.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={link}
                        onChange={(e) => updatePortfolioLink(i, e.target.value)}
                        className={inputClass}
                        placeholder="https://github.com/yourname"
                      />
                      {portfolioLinks.length > 1 && (
                        <button
                          onClick={() =>
                            setPortfolioLinks(
                              portfolioLinks.filter((_, idx) => idx !== i),
                            )
                          }
                          className="text-gray-300 hover:text-gray-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setPortfolioLinks([...portfolioLinks, ""])}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Plus size={16} /> Add another link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Review your profile
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Everything look good?
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Bio", value: bio || "Not added", filled: !!bio },
                  {
                    label: "Profile photo",
                    value: avatar ? avatar.name : "Not uploaded",
                    filled: !!avatar,
                  },
                  {
                    label: "Work experience",
                    value: `${experiences.filter((e) => e.company).length} role(s) added`,
                    filled: experiences.some((e) => e.company),
                  },
                  {
                    label: "Education",
                    value: `${educations.filter((e) => e.institution).length} institution(s) added`,
                    filled: educations.some((e) => e.institution),
                  },
                  {
                    label: "Skills",
                    value: skills.length > 0 ? skills.join(", ") : "None added",
                    filled: skills.length > 0,
                  },
                  {
                    label: "Certifications",
                    value: `${certifications.filter((c) => c.name).length} certification(s) added`,
                    filled: certifications.some((c) => c.name),
                  },
                  {
                    label: "CV",
                    value: cv ? cv.name : "Not uploaded",
                    filled: !!cv,
                  },
                  {
                    label: "Portfolio links",
                    value:
                      portfolioLinks.filter((l) => l.trim()).length > 0
                        ? `${portfolioLinks.filter((l) => l.trim()).length} link(s)`
                        : "None added",
                    filled: portfolioLinks.some((l) => l.trim()),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                    <span
                      className={`text-sm text-right max-w-xs ${item.filled ? "text-gray-600" : "text-gray-300"}`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex flex-col md:flex-row gap-5 items-center md:justify-between mt-8 pt-3 md:pt-6 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Step {step} of {STEPS.length}
            </span>
            {/* buttons */}
            <div className="flex items-center gap-3">
              {/* Back button */}
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1 || saving}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-0 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>

              <span className="text-xs text-gray-400">
                Step {step} of {STEPS.length}
              </span>

              {step < STEPS.length ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Finish"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
