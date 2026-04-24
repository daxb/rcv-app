// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMyPoll } from "@/lib/myPolls";

const inputCls = "w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function ManagePage() {
  const router = useRouter();
  const [pollId, setPollId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const id = pollId.trim().toLowerCase();
    const pass = password.trim();
    if (!id || !pass) {
      setError("Enter both an election ID and passphrase.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/polls/${id}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      if (res.status === 404) { setError("No election with that ID."); return; }
      if (res.status === 401) { setError("That passphrase is incorrect."); return; }
      if (!res.ok) { setError("Something went wrong. Try again."); return; }

      // Fetch the title so My Elections has a readable label.
      let title = id;
      try {
        const pollRes = await fetch(`/api/polls/${id}`);
        if (pollRes.ok) {
          const data = (await pollRes.json()) as { title?: string };
          if (typeof data.title === "string") title = data.title;
        }
      } catch {
        // best-effort — fall back to id as title
      }

      addMyPoll({ id, title, password: pass });
      router.push(`/admin/${id}/dashboard`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage an Election</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
          Enter the election ID and admin passphrase shown when the election was created.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Election ID</label>
          <input
            type="text"
            value={pollId}
            onChange={(e) => setPollId(e.target.value)}
            placeholder="e.g. rkwb"
            className={`${inputCls} font-mono`}
            autoComplete="off"
            autoCapitalize="none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin passphrase</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="e.g. apple-town-blue"
            className={`${inputCls} font-mono`}
            autoComplete="off"
            autoCapitalize="none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? "Signing in…" : "Open dashboard"}
        </button>
      </form>
    </div>
  );
}
