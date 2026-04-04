"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import { signOut } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  LogOut,
  Menu,
  X,
  Building2,
  Plus,
  Settings,
} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Applications", href: "/dashboard/applications", icon: FileText },
];

interface DashboardNavProps {
  profile: Profile | null;
}

export default function DashboardNav({ profile }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    setSigningOut(true);
    signOut();
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile topbar */}
      <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-semibold text-gray-900">Worka</span>
        <div className="w-5" />
      </header>

      {/* Sidebar */}
      <aside
        className={`
        fixed h-screen w-64 bg-white border-r border-gray-100 z-30 flex flex-col transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:z-auto
      `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-base font-semibold text-gray-900"
          >
            Worka
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Company info */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
              {profile?.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 size={16} className="text-gray-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.company_name || "Your Company"}
              </p>
              <p className="text-xs text-gray-400 truncate capitalize">
                {profile?.industry || "Employer"}
              </p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-gray-100 mt-2">
            <Link
              href="/dashboard/jobs/new"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Plus size={16} />
              Post a job
            </Link>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-1">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings size={16} />
            Settings
          </Link>
          <button
            onClick={() => setShowSignOutModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Sign out confirm modal */}
      <ConfirmModal
        isOpen={showSignOutModal}
        title="Sign out?"
        description="You'll need to sign in again to access your dashboard."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        variant="warning"
        loading={signingOut}
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />
    </>
  );
}
