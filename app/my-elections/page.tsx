// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyPolls, removeMyPoll, type MyPoll } from "@/lib/myPolls";

export default function MyElectionsPage() {
  const router = useRouter();
  const [polls, setPolls] = useState<MyPoll[] | null>(null);

  useEffect(() => {
    setPolls(getMyPolls());
  }, []);

  function handleRemove(id: string) {
    if (!confirm("Remove this election from this browser? The election itself will not be deleted; you can still sign in via the Manage page.")) return;
    removeMyPoll(id);
    setPolls(getMyPolls());
  }

  function handleOpen(poll: MyPoll) {
    router.push(`/admin/${poll.id}?password=${encodeURIComponent(poll.password)}`);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Elections</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Elections created on this browser. Stored locally — not synced across devices.
        </p>
      </div>

      {polls === null ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : polls.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No elections saved in this browser yet.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/create"
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create an election
            </Link>
            <Link
              href="/manage"
              className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Sign in to an existing one
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{poll.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">ID: {poll.id}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleOpen(poll)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                >
                  Open dashboard
                </button>
                <button
                  onClick={() => handleRemove(poll.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 text-sm px-2"
                  aria-label="Remove from this browser"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
