// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginForm({ pollId }: { pollId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoSubmittedRef = useRef(false);

  async function submitPassword(pass: string) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/polls/${pollId}/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Invalid password."); return; }
      router.push(`/admin/${pollId}/dashboard`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoSubmittedRef.current) return;
    const queryPassword = searchParams.get("password");
    if (queryPassword) {
      autoSubmittedRef.current = true;
      setPassword(queryPassword);
      void submitPassword(queryPassword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitPassword(password);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin passphrase</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="e.g. apple-town-blue"
          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          autoComplete="off"
          autoCapitalize="none"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading || !password.trim()}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
      >
        {loading ? "Verifying…" : "Log In"}
      </button>
    </form>
  );
}
