import { cookies } from "next/headers";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function cookieName(pollId: string) {
  return `rcv_admin_${pollId}`;
}

export async function setAdminSession(pollId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(cookieName(pollId), "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function isAdminAuthenticated(pollId: string): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName(pollId))?.value === "1";
}

export async function clearAdminSession(pollId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName(pollId));
}
