// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Ballot {
  id: string;
  rankings: string[];
  voterToken: string;
  createdAt: string;
}

interface Props {
  pollId: string;
  ballotCount: number;
}

export default function BallotReview({ pollId, ballotCount }: Props) {
  const router = useRouter();
  const [ballots, setBallots] = useState<Ballot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function loadBallots() {
    setLoading(true);
    try {
      const res = await fetch(`/api/polls/${pollId}/admin/ballots`);
      const data = await res.json() as Ballot[];
      setBallots(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/polls/${pollId}/admin/ballots`, { method: "DELETE" });
      router.push("/elections");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Ballots
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">{ballotCount} submitted</span>
          <Link href={`/polls/${pollId}/results`} className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
            View Results
          </Link>
        </div>
      </div>

      {ballots === null ? (
        <button
          onClick={loadBallots}
          disabled={loading}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load ballot details"}
        </button>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left py-1.5 px-2 text-gray-500 dark:text-gray-400 font-medium">Voter</th>
                <th className="text-left py-1.5 px-2 text-gray-500 dark:text-gray-400 font-medium">Rankings</th>
                <th className="text-left py-1.5 px-2 text-gray-500 dark:text-gray-400 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {ballots.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <td className="py-2 px-2 font-mono text-gray-400 dark:text-gray-500">{b.voterToken}</td>
                  <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                    {b.rankings.map((r, i) => (
                      <span key={i}>{i + 1}. {r}{i < b.rankings.length - 1 ? " · " : ""}</span>
                    ))}
                  </td>
                  <td className="py-2 px-2 text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {new Date(b.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ballots.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No ballots yet.</p>
          )}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs font-semibold text-red-600 dark:text-red-500 uppercase tracking-wide mb-2">Danger Zone</p>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm text-red-500 border border-red-200 dark:border-red-800 px-4 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            Delete this election
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure? This cannot be undone.</p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button onClick={() => setShowConfirm(false)} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
