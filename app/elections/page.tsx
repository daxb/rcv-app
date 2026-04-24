// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { prisma } from "@/lib/prisma";
import ElectionCard from "@/components/ElectionCard";
import Link from "next/link";

export const revalidate = 30;

export default async function ElectionsPage() {
  let polls;
  try {
    polls = await prisma.poll.findMany({
      where: { status: "open", visible: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        options: true,
        deadline: true,
        allowWriteIn: true,
        voterPasswordHash: true,
        createdAt: true,
        _count: { select: { ballots: true } },
      },
    });
  } catch (e) {
    console.error("[elections] prisma.poll.findMany failed:", e);
    throw e;
  }

  const formattedPolls = polls.map((p) => ({
    ...p,
    options: JSON.parse(p.options) as string[],
    ballotCount: p._count.ballots,
    hasVoterPassword: p.voterPasswordHash != null,
    voterPasswordHash: undefined,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Open Elections</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Browse and vote in active elections below.</p>
      </div>

      {formattedPolls.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No open elections yet.</p>
          <Link
            href="/create"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create the first one
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {formattedPolls.map((poll) => (
            <ElectionCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
