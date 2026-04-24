// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { runIRV } from "@/lib/irv";
import RoundsViz from "@/components/RoundsViz";
import Link from "next/link";

export const revalidate = 15;

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { ballots: true },
  });

  if (!poll) notFound();

  const options = JSON.parse(poll.options) as string[];
  const ballots = poll.ballots.map((b) => JSON.parse(b.rankings) as string[]);
  const result = runIRV(ballots, options);

  const isClosed =
    poll.status === "closed" ||
    (poll.deadline != null && new Date() > poll.deadline);

  return (
    <div>
      <div className="mb-2">
        <Link href="/elections" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
          ← All elections
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{poll.title}</h1>
        {poll.description && (
          <p className="mt-1 text-gray-500 dark:text-gray-400">{poll.description}</p>
        )}
        <div className="mt-2 flex gap-4 text-sm text-gray-400 dark:text-gray-500">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isClosed
                ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400"
            }`}
          >
            {isClosed ? "Closed" : "Open"}
          </span>
          <span>{poll.ballots.length} ballots</span>
        </div>
      </div>

      {poll.ballots.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500 dark:text-gray-400">
          No votes have been cast yet.
          {!isClosed && (
            <div className="mt-4">
              <Link
                href={`/${id}`}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Be the first to vote
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {isClosed && (
            <div
              className={`rounded-xl border p-6 mb-6 ${
                result.winner
                  ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800"
                  : "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
              }`}
            >
              {result.winner ? (
                <>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-1">
                    Winner
                  </p>
                  <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
                    {result.winner}
                  </p>
                </>
              ) : (
                <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">
                  This election ended in a tie — no winner could be determined.
                </p>
              )}
            </div>
          )}

          <RoundsViz rounds={result.rounds} options={options} />
        </>
      )}

      {!isClosed && (
        <div className="mt-6">
          <Link
            href={`/${id}`}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
          >
            ← Back to voting
          </Link>
        </div>
      )}
    </div>
  );
}
