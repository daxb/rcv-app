// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import Link from "next/link";

interface Props {
  poll: {
    id: string;
    title: string;
    description: string;
    options: string[];
    deadline: Date | null;
    allowWriteIn: boolean;
    hasVoterPassword: boolean;
    ballotCount: number;
  };
}

export default function ElectionCard({ poll }: Props) {
  const isExpiringSoon =
    poll.deadline &&
    new Date(poll.deadline).getTime() - Date.now() < 1000 * 60 * 60 * 24;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{poll.title}</h2>
          {poll.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{poll.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span>{poll.options.length} candidates</span>
            <span>{poll.ballotCount} votes</span>
            {poll.allowWriteIn && <span>Write-ins allowed</span>}
            {poll.hasVoterPassword && <span className="text-amber-500 dark:text-amber-400">Password required</span>}
            {poll.deadline && (
              <span className={isExpiringSoon ? "text-orange-500 font-medium" : ""}>
                Closes {new Date(poll.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Link
            href={`/polls/${poll.id}`}
            className="bg-indigo-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors text-center"
          >
            Vote
          </Link>
          <Link
            href={`/polls/${poll.id}/results`}
            className="text-gray-500 dark:text-gray-400 text-sm px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
          >
            Results
          </Link>
        </div>
      </div>
    </div>
  );
}
