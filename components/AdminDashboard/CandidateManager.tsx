"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  pollId: string;
  options: string[];
}

export default function CandidateManager({ pollId, options: initialOptions }: Props) {
  const router = useRouter();
  const [options, setOptions] = useState(initialOptions);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setError("");
    setAdding(true);
    try {
      const res = await fetch(`/api/polls/${pollId}/admin/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json() as { options?: string[]; error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to add."); return; }
      setOptions(data.options!);
      setNewName("");
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(name: string) {
    setError("");
    const res = await fetch(`/api/polls/${pollId}/admin/candidates`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json() as { options?: string[]; error?: string };
    if (!res.ok) { setError(data.error ?? "Failed to remove."); return; }
    setOptions(data.options!);
    router.refresh();
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
        Candidates
      </h2>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-2 mb-3">
          {error}
        </div>
      )}

      <ul className="space-y-2 mb-4">
        {options.map((opt) => (
          <li key={opt} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-800 dark:text-gray-200">{opt}</span>
            <button
              onClick={() => handleRemove(opt)}
              className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors"
              disabled={options.length <= 2}
              title={options.length <= 2 ? "Must have at least 2 candidates" : "Remove"}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          placeholder="New candidate name"
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </div>
    </div>
  );
}
