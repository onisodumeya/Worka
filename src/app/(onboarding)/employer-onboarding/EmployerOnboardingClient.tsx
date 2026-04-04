"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Toaster, toast } from "sonner";
import { Profile } from "@/types";
import {
  Building2,
  MapPin,
  Share2,
  ChevronRight,
  ChevronLeft,
  Globe,
} from "lucide-react";
import Button from "@/components/Button";

const STEPS = [
  { id: 1, label: "Identity", icon: Building2 },
  { id: 2, label: "Details", icon: MapPin },
  { id: 3, label: "Socials", icon: Share2 },
  { id: 4, label: "Review", icon: Globe },
];

export default function EmployerOnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [skipping, setSkipping] = useState(false);

  // Step 1 — Identity
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  // Step 2 — Details
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("industry, company_size")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
    fetchProfile();
  }, []);

  // Step 3 — Socials
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
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
      toast.loading("Uploading logo...", { id: "saving" });

      let logo_url = "";
      if (logo) {
        const { data, error } = await supabase.storage
          .from("logos")
          .upload(`${user.id}/logo`, logo, { upsert: true });
        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from("logos")
            .getPublicUrl(data.path);
          logo_url = urlData.publicUrl;
        }
      }

      toast.loading("Saving company profile...", { id: "saving" });

      await supabase
        .from("profiles")
        .update({
          logo_url: logo_url || undefined,
          website_url: website || undefined,
          description: description || undefined,
          location: location || undefined,
          linkedin_url: linkedin || undefined,
          twitter_url: twitter || undefined,
          industry: industry || undefined,
          company_size: companySize || undefined,
          employer_onboarding_complete: true,
        })
        .eq("id", user.id);

      toast.success("Company profile complete!", { id: "saving" });
      router.push("/dashboard");
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
        .update({ employer_onboarding_complete: true })
        .eq("id", user.id);
    }
    router.push("/dashboard");
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen ">
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Set up your company profile
          </h1>
          <Button
            variant="ghost"
            click={handleSkip}
            loading={skipping || saving}
            className="w-fit"
          >
            {skipping ? "Skipping..." : "Skip for now"}
          </Button>
        </div>
      </div>

      {/* Progress steps */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 b hidden md:block">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isComplete = step > s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isComplete || isCurrent
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
                      className={`h-px w-16 sm:w-40 mx-1 mb-4 transition-all ${
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* Step 1 — Identity */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Company identity
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Help candidates recognise your brand
                </p>
              </div>

              {/* Logo upload */}
              <div>
                <label className={labelClass}>Company logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 size={24} className="text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    {logoPreview ? "Change logo" : "Upload logo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Website */}
              <div>
                <label className={labelClass}>Company website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputClass}
                  placeholder="https://yourcompany.com"
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>About the company</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Tell candidates what your company does, your mission, culture, and what makes you a great place to work..."
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-1 text-xs text-gray-400">
                  {description.length}/1000 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Company details
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Where is your company based?
                </p>
              </div>

              <div>
                <label className={labelClass}>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={inputClass}
                  placeholder="Lagos, Nigeria"
                />
              </div>

              {/* Show fields if missing, info message if already filled */}
              {!profile?.industry || !profile?.company_size ? (
                <div className="space-y-4">
                  {!profile?.industry && (
                    <div>
                      <label className={labelClass}>Industry</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select industry</option>
                        <option value="fintech">Fintech</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="healthtech">Healthtech</option>
                        <option value="edtech">Edtech</option>
                        <option value="logistics">Logistics</option>
                        <option value="media">Media & Entertainment</option>
                        <option value="consulting">Consulting</option>
                        <option value="government">Government</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  {!profile?.company_size && (
                    <div>
                      <label className={labelClass}>Company size</label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select size</option>
                        <option value="1-10">1–10 employees</option>
                        <option value="11-50">11–50 employees</option>
                        <option value="51-200">51–200 employees</option>
                        <option value="201-500">201–500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    The following details were collected at signup and can be
                    updated later in your company settings.
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Industry</span>
                      <span className="text-gray-700 font-medium capitalize">
                        {profile.industry}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Company size</span>
                      <span className="text-gray-700 font-medium">
                        {profile.company_size}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Socials */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Social links
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Help candidates find and follow you
                </p>
              </div>

              <div>
                <label className={labelClass}>LinkedIn</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    linkedin.com/company/
                  </span>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full pl-44 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                    placeholder="yourcompany"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Twitter / X</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    x.com/
                  </span>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full pl-16 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                    placeholder="yourcompany"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Review your profile
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Everything look good?
                </p>
              </div>

              <div className="space-y-1">
                {[
                  {
                    label: "Company logo",
                    value: logo ? logo.name : "Not uploaded",
                    filled: !!logo,
                  },
                  {
                    label: "Website",
                    value: website || "Not added",
                    filled: !!website,
                  },
                  {
                    label: "Description",
                    value: description
                      ? `${description.slice(0, 60)}...`
                      : "Not added",
                    filled: !!description,
                  },
                  {
                    label: "Location",
                    value: location || "Not added",
                    filled: !!location,
                  },
                  {
                    label: "LinkedIn",
                    value: linkedin
                      ? `linkedin.com/company/${linkedin}`
                      : "Not added",
                    filled: !!linkedin,
                  },
                  {
                    label: "Twitter / X",
                    value: twitter ? `x.com/${twitter}` : "Not added",
                    filled: !!twitter,
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
                      className={`text-sm text-right max-w-xs truncate ${item.filled ? "text-gray-600" : "text-gray-300"}`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <Button
              click={() => setStep((s) => s - 1)}
              loading={step === 1 || saving}
              className="w-fit"
              variant="ghost"
            >
              <ChevronLeft size={16} /> Back
            </Button>

            <span className="text-xs text-gray-400">
              Step {step} of {STEPS.length}
            </span>

            {step < STEPS.length ? (
              <Button click={() => setStep((s) => s + 1)} loading={saving}>
                Next <ChevronRight size={16} />
              </Button>
            ) : (
              <Button click={handleFinish} loading={saving}>
                {saving ? "Saving..." : "Finish"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
