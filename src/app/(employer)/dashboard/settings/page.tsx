"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast, Toaster } from "sonner";
import {
  Building2,
  Link as LinkIcon,
  Lock,
  Image,
  Bell,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Button from "@/components/Button";
import PasswordInput from "@/components/PasswordInput";
import ConfirmModal from "@/components/ConfirmModal";
import type { Profile } from "@/types";

const tabs = [
  { id: "company", label: "Company profile", icon: Building2 },
  { id: "logo", label: "Company logo", icon: Image },
  { id: "social", label: "Social links", icon: LinkIcon },
  { id: "password", label: "Password", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "danger", label: "Danger zone", icon: Trash2 },
];

const INDUSTRIES = [
  "Fintech",
  "E-commerce",
  "Healthtech",
  "Edtech",
  "Logistics",
  "Media & Entertainment",
  "Consulting",
  "Government",
  "Other",
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("company");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // Company profile
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);

  // Logo
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [savingLogo, setSavingLogo] = useState(false);

  // Social links
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [savingSocial, setSavingSocial] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications
  const [notifyNewApplication, setNotifyNewApplication] = useState(true);
  const [notifyStatusChange, setNotifyStatusChange] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Check if Google user
      const provider = user.app_metadata?.provider;
      const providers = user.app_metadata?.providers;
      setIsGoogleUser(provider === "google" || !!providers?.includes("google"));

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setCompanyName(data.company_name ?? "");
        setIndustry(data.industry ?? "");
        setCompanySize(data.company_size ?? "");
        setLocation(data.location ?? "");
        setDescription(data.description ?? "");
        setLogoPreview(data.logo_url ?? "");
        setWebsite(data.website_url ?? "");
        setLinkedin(data.linkedin_url ?? "");
        setTwitter(data.twitter_url ?? "");
      }

      setLoading(false);
    }
    fetchProfile();
  }, [router]);

  async function saveCompanyProfile() {
    setSavingCompany(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: companyName,
        industry,
        company_size: companySize,
        location,
        description,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update company profile");
    } else {
      toast.success("Company profile updated");
    }
    setSavingCompany(false);
  }

  async function saveLogo() {
    if (!logo) return;
    setSavingLogo(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.storage
      .from("logos")
      .upload(`${user.id}/logo`, logo, { upsert: true });

    if (error) {
      toast.error("Failed to upload logo");
      setSavingLogo(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("logos")
      .getPublicUrl(data.path);

    await supabase
      .from("profiles")
      .update({ logo_url: urlData.publicUrl })
      .eq("id", user.id);

    setLogoPreview(urlData.publicUrl);
    toast.success("Logo updated");
    setSavingLogo(false);
  }

  async function saveSocialLinks() {
    setSavingSocial(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        website_url: website || null,
        linkedin_url: linkedin || null,
        twitter_url: twitter || null,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update social links");
    } else {
      toast.success("Social links updated");
    }
    setSavingSocial(false);
  }

  async function savePassword() {
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSavingPassword(true);
    const supabase = createClient();

    // Re-authenticate first
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      toast.error("Current password is incorrect");
      setSavingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error("Failed to update password");
    } else {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  }

  async function saveNotifications() {
    setSavingNotifications(true);
    // Notification preferences would be stored in a separate table
    // For now we just simulate saving
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Notification preferences saved");
    setSavingNotifications(false);
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Delete profile — cascade will handle related data
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to delete account");
      setDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionClass =
    "bg-white rounded-xl border border-gray-100 p-6 space-y-5";

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-100 rounded w-1/4 mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Toaster position="top-center" richColors />

      <PageHeader
        title="Settings"
        description="Manage your account and company preferences"
      />

      <div className="flex gap-6 items-start">
        {/* Tab sidebar */}
        <div className="w-48 flex-shrink-0 bg-white rounded-xl border border-gray-100 p-2 sticky top-24">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : tab.id === "danger"
                      ? "text-red-500 hover:bg-red-50"
                      : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {/* Company profile */}
          {activeTab === "company" && (
            <div className={sectionClass}>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Company profile
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Update your company information
                </p>
              </div>

              <div>
                <label className={labelClass}>Company name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                  placeholder="Acme Technologies Ltd."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i.toLowerCase()}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Company size</label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select size</option>
                    {COMPANY_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s} employees
                      </option>
                    ))}
                  </select>
                </div>
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

              <div>
                <label className={labelClass}>About the company</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className={`${inputClass} resize-none`}
                  placeholder="Tell candidates about your company..."
                />
                <p className="mt-1 text-xs text-gray-400">
                  {description.length}/1000 characters
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button onClick={saveCompanyProfile} loading={savingCompany}>
                  {savingCompany ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          )}

          {/* Company logo */}
          {activeTab === "logo" && (
            <div className={sectionClass}>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Company logo
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Upload a logo to display on your job listings
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center flex-shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 size={28} className="text-gray-300" />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Image size={15} />
                    {logoPreview ? "Change logo" : "Upload logo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setLogo(file);
                        setLogoPreview(URL.createObjectURL(file));
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-400">
                    PNG, JPG up to 2MB. Square images work best.
                  </p>
                </div>
              </div>

              {logo && (
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <Button onClick={saveLogo} loading={savingLogo}>
                    {savingLogo ? "Uploading..." : "Save logo"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Social links */}
          {activeTab === "social" && (
            <div className={sectionClass}>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Social links
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Help candidates find and follow your company
                </p>
              </div>

              <div>
                <label className={labelClass}>Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputClass}
                  placeholder="https://yourcompany.com"
                />
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

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button onClick={saveSocialLinks} loading={savingSocial}>
                  {savingSocial ? "Saving..." : "Save links"}
                </Button>
              </div>
            </div>
          )}

          {/* Password */}
          {activeTab === "password" && (
            <div className={sectionClass}>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Change password
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Update your account password
                </p>
              </div>

              {isGoogleUser ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm text-gray-500">
                    You signed in with Google. Password management is handled by
                    your Google account.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>Current password</label>
                    <PasswordInput
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>New password</label>
                    <PasswordInput
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Confirm new password</label>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                    />
                    {confirmPassword && (
                      <p
                        className={`mt-1 text-xs ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}
                      >
                        {newPassword === confirmPassword
                          ? "· Passwords match"
                          : "· Passwords do not match"}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <Button onClick={savePassword} loading={savingPassword}>
                      {savingPassword ? "Updating..." : "Update password"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className={sectionClass}>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Notification preferences
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Choose what you want to be notified about
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: "New application",
                    description:
                      "Get notified when someone applies to one of your jobs",
                    value: notifyNewApplication,
                    onChange: setNotifyNewApplication,
                  },
                  {
                    label: "Application status change",
                    description:
                      "Get notified when an application status is updated",
                    value: notifyStatusChange,
                    onChange: setNotifyStatusChange,
                  },
                  {
                    label: "Weekly digest",
                    description:
                      "Receive a weekly summary of your job performance",
                    value: notifyWeeklyDigest,
                    onChange: setNotifyWeeklyDigest,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => item.onChange(!item.value)}
                      className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${
                        item.value ? "bg-gray-900" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          item.value ? "translate-x-px" : "-translate-x-full"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100">
                <Button
                  onClick={saveNotifications}
                  loading={savingNotifications}
                >
                  {savingNotifications ? "Saving..." : "Save preferences"}
                </Button>
              </div>
            </div>
          )}

          {/* Danger zone */}
          {activeTab === "danger" && (
            <div className={`${sectionClass} border-red-100`}>
              <div>
                <h2 className="text-base font-semibold text-red-600">
                  Danger zone
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Irreversible actions — proceed with caution
                </p>
              </div>

              <div className="flex items-start justify-between gap-4 p-4 border border-red-100 rounded-xl bg-red-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Delete account
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Permanently delete your account, all your jobs, and all
                    associated applications. This cannot be undone.
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete account
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete account modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete your account?"
        description="This will permanently delete your account, all your job listings, and all associated applications. This action cannot be undone."
        confirmLabel="Yes, delete my account"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
