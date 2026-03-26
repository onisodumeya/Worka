import { getFlowCookie, clearFlowCookie } from "@/lib/utils/flow-cookies";
import { redirect } from "next/navigation";
import ConfirmEmailClient from "./ConfirmEmailClient";

export default async function ConfirmEmailPage() {
  const canAccess = await getFlowCookie("just_signed_up");
  if (!canAccess) redirect("/signup");
  await clearFlowCookie("just_signed_up");
  return <ConfirmEmailClient />;
}
