// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls = "w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function CreatePollForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [deadline, setDeadline] = useState("");
  const [allowWriteIn, setAllowWriteIn] = useState(false);
  const [visible, setVisible] = useState(true);
  const [voterPassword, setVoterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{ pollId: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function addOption() { setOptions([...options, ""]); }
  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  }
  function updateOption(i: number, value: string) {
    const next = [...options]; next[i] = value; setOptions(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanOptions = options.filter((o) => o.trim());
    if (!title.trim()) { setError("Title is required."); return; }
    if (cleanOptions.length < 2) { setError("At least 2 candidates are required."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, options: cleanOptions, deadline: deadline || undefined, allowWriteIn, visible, voterPassword: voterPassword || undefined }),
      });
      const data = await res.json() as { id?: string; adminPassword?: string; error?: string };
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setCreated({ pollId: data.id!, password: data.adminPassword! });
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!created) return;
    navigator.clipboard.writeText(created.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (created) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-amber-300 dark:border-amber-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Election Created!</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Save this admin password — it will only be shown once:
        </p>
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 rounded-lg px-4 py-3 font-mono text-2xl font-bold text-amber-900 dark:text-amber-300 text-center tracking-widest mb-4 select-all">
          {created.password}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Use this password to manage candidates, configure settings, review votes, or close the election.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {copied ? "Copied!" : "Copy password"}
          </button>
          <button
            onClick={() => router.push(`/admin/${created.pollId}/dashboard`)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Best Pizza Topping" className={inputCls} required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional context for voters" rows={2} className={`${inputCls} resize-none`} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Candidates *</label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Candidate ${i + 1}`} className={inputCls} />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(i)} className="text-gray-400 hover:text-red-500 px-2 transition-colors text-xl leading-none" aria-label="Remove candidate">×</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addOption} className="mt-2 text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
          + Add candidate
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline (optional)</label>
          <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={allowWriteIn} onChange={(e) => setAllowWriteIn(e.target.checked)} className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
            Allow write-in candidates
          </label>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
        Show on public elections listing
      </label>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Voter password <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
        </label>
        <input type="text" value={voterPassword} onChange={(e) => setVoterPassword(e.target.value)} placeholder="Leave blank for open voting" className={inputCls} />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">If set, voters must enter this password before they can rank candidates.</p>
      </div>

      <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium">
        {loading ? "Creating…" : "Create Election"}
      </button>
    </form>
  );
}
