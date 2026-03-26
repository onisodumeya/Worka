"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Button from "@/components/Button";

export default function SelectRolePage() {
  const [role, setRole] = useState<"freelancer" | "employer">("freelancer");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("user:", user);
    console.log("user error:", userError);

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user.id);

    console.log("update error:", error);
    console.log("role selected:", role);

    if (error) {
      console.log("update error:", error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.refresh();
    if (role === "employer") {
      router.push("/dashboard");
    } else {
      router.push("/jobs");
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">One last thing</h1>
        <p className="text-sm text-gray-500 mt-1">
          How will you be using the platform?
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="relative flex cursor-pointer">
            <input
              type="radio"
              name="role"
              value="freelancer"
              checked={role === "freelancer"}
              onChange={() => setRole("freelancer")}
              className="peer sr-only"
            />
            <div className="w-full p-4 border border-gray-200 rounded-xl text-sm text-center peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white transition-all">
              <p className="font-medium">Freelancer</p>
              <p className="text-xs mt-1 opacity-70">I'm looking for work</p>
            </div>
          </label>
          <label className="relative flex cursor-pointer">
            <input
              type="radio"
              name="role"
              value="employer"
              checked={role === "employer"}
              onChange={() => setRole("employer")}
              className="peer sr-only"
            />
            <div className="w-full p-4 border border-gray-200 rounded-xl text-sm text-center peer-checked:border-gray-900 peer-checked:bg-gray-900 peer-checked:text-white transition-all">
              <p className="font-medium">Employer</p>
              <p className="text-xs mt-1 opacity-70">I'm hiring talent</p>
            </div>
          </label>
        </div>

        <Button click={handleSubmit} loading={loading} className="w-full">
          {loading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </>
  );
}
