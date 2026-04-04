"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useRef, useEffect } from "react";
import ConfirmModal from "../ConfirmModal";
import { signOut } from "@/lib/actions/auth";
import {
  Briefcase,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Bookmark,
  MessageSquare,
  Settings,
  ChevronDown,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";

const navItems = [
  { label: "Jobs", href: "/", icon: Briefcase },
  { label: "Applications", href: "/applications", icon: FileText },
];

interface FreelancerNavProps {
  profile: {
    full_name: string;
    avatar_url?: string;
    onboarding_complete?: boolean;
    role?: string;
  } | null;
  user: SupabaseUser | null;
}

export default function FreelancerNav({ profile, user }: FreelancerNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Close account dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
  }, [menuOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    signOut();
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="text-base font-semibold text-gray-900 shrink-0"
          >
            Worka
          </Link>

          {/* Main nav — desktop */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-1">
            {user ? (
              <>
                {/* Saved jobs */}
                <Link
                  href="/saved"
                  className={`hidden md:flex w-9 h-9 items-center justify-center rounded-lg transition-colors relative ${
                    pathname === "/saved"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                  title="Saved jobs"
                >
                  <Bookmark size={18} />
                </Link>

                {/* Messages */}
                <Link
                  href="/messages"
                  className={`hidden md:flex w-9 h-9 items-center justify-center rounded-lg transition-colors relative ${
                    pathname === "/messages"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                  title="Messages"
                >
                  <MessageSquare size={18} />
                  {/* Unread badge — wire up later */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                </Link>

                {/* Notifications */}
                <Link
                  href="/notifications"
                  className={`hidden md:flex w-9 h-9 items-center justify-center rounded-lg transition-colors relative ${
                    pathname === "/notifications"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                  title="Notifications"
                >
                  <Bell size={18} />
                  {/* Unread badge — wire up later */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </Link>

                {/* Divider */}
                <div className="hidden md:block w-px h-5 bg-gray-200 mx-1" />

                {/* Account dropdown */}
                <div ref={accountRef} className="relative hidden md:block">
                  <button
                    onClick={() => setAccountOpen((s) => !s)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center shrink-0">
                      {profile?.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                          width={28}
                          height={28}
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-500">
                          {profile?.full_name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 font-medium max-w-25 truncate">
                      {profile?.full_name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform ${accountOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-gray-100 shadow-lg z-20 overflow-hidden py-1">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {profile?.full_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Freelancer
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <User size={15} />
                          My profile
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Settings size={15} />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={() => {
                            setAccountOpen(false);
                            setShowSignOutModal(true);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut size={15} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <ConfirmModal
                  isOpen={showSignOutModal}
                  title="Sign out?"
                  description="You'll need to sign in again to access your account."
                  confirmLabel="Sign out"
                  cancelLabel="Stay signed in"
                  variant="warning"
                  loading={signingOut}
                  onConfirm={handleSignOut}
                  onCancel={() => setShowSignOutModal(false)}
                />
              </>
            ) : (
              // Logged out
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute w-full h-screen bg-black/10">
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 w-full h-fit">
            {user ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center shrink-0">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                        width={28}
                        height={28}
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-500">
                        {profile?.full_name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile?.full_name}
                    </p>
                    <p className="text-xs text-gray-400">Freelancer</p>
                  </div>
                </div>

                {/* Nav items */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={15} />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Icon items */}
                {[
                  { label: "Saved jobs", href: "/saved", icon: Bookmark },
                  { label: "Messages", href: "/messages", icon: MessageSquare },
                  {
                    label: "Notifications",
                    href: "/notifications",
                    icon: Bell,
                  },
                  { label: "Profile", href: "/profile", icon: User },
                  { label: "Settings", href: "/settings", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        pathname === item.href
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={15} />
                      {item.label}
                    </Link>
                  );
                })}

                <button
                  onClick={() => setShowSignOutModal(true)}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>

                <ConfirmModal
                  isOpen={showSignOutModal}
                  title="Sign out?"
                  description="You'll need to sign in again to access your account."
                  confirmLabel="Sign out"
                  cancelLabel="Stay signed in"
                  variant="warning"
                  loading={signingOut}
                  onConfirm={handleSignOut}
                  onCancel={() => setShowSignOutModal(false)}
                />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-gray-900 text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
