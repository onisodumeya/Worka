import { cookies } from "next/headers";

export async function setFlowCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, "true", {
    httpOnly: true,
    maxAge: 60 * 30, // 30 minutes
    path: "/",
  });
}

export async function getFlowCookie(name: string) {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value === "true";
}

export async function clearFlowCookie(name: string) {
  const cookieStore = await cookies();
  cookieStore.delete(name);
}
