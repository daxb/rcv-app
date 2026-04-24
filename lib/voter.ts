// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { cookies } from "next/headers";

const COOKIE_NAME = "rcv_voter";
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function getOrCreateVoterToken(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME);
  if (existing) return existing.value;

  const token = crypto.randomUUID();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
  return token;
}

export async function getVoterToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setVoterAccess(pollId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(`rcv_access_${pollId}`, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function hasVoterAccess(pollId: string): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(`rcv_access_${pollId}`)?.value === "1";
}
