// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
//
// localStorage-backed "My Elections" list. Pure functions — safe to import
// from client components. No-ops when called on the server (guarded by
// typeof window checks).

const STORAGE_KEY = "rcv_my_polls";

export type MyPoll = {
  id: string;
  title: string;
  password: string;
  createdAt: string;
};

function read(): MyPoll[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p) =>
        p && typeof p.id === "string" && typeof p.title === "string" && typeof p.password === "string"
    );
  } catch {
    return [];
  }
}

function write(polls: MyPoll[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
  } catch {
    // localStorage full or disabled — fail silently
  }
}

export function getMyPolls(): MyPoll[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addMyPoll(entry: Omit<MyPoll, "createdAt"> & { createdAt?: string }): void {
  const polls = read();
  const createdAt = entry.createdAt ?? new Date().toISOString();
  const next = [
    { id: entry.id, title: entry.title, password: entry.password, createdAt },
    ...polls.filter((p) => p.id !== entry.id),
  ];
  write(next);
}

export function removeMyPoll(id: string): void {
  write(read().filter((p) => p.id !== id));
}
