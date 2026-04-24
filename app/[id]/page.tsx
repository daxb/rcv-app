// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getVoterToken, hasVoterAccess } from "@/lib/voter";
import RankingBallot from "@/components/RankingBallot";
import VotePageClient from "@/components/VotePageClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { _count: { select: { ballots: true } } },
  });

  if (!poll) notFound();

  const isClosed =
    poll.status === "closed" ||
    (poll.deadline != null && new Date() > poll.deadline);

  if (isClosed) redirect(`/${id}/results`);

  const options = JSON.parse(poll.options) as string[];
  const voterToken = await getVoterToken();
  const hasVoted =
    voterToken != null &&
    (await prisma.ballot.findUnique({
      where: { pollId_voterToken: { pollId: id, voterToken } },
    })) != null;

  const requiresPassword = poll.voterPasswordHash != null;
  const accessGranted = requiresPassword ? await hasVoterAccess(id) : true;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Link href="/elections" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
          ← All elections
        </Link>
        <Link href={`/admin/${id}`} className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
          Manage this election →
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{poll.title}</h1>
        {poll.description && (
          <p className="mt-1 text-gray-500 dark:text-gray-400">{poll.description}</p>
        )}
        <div className="mt-2 flex gap-4 text-sm text-gray-400 dark:text-gray-500">
          <span>{options.length} candidates</span>
          <span>{poll._count.ballots} votes cast</span>
          {poll.deadline && (
            <span>Closes {new Date(poll.deadline).toLocaleDateString()}</span>
          )}
          {requiresPassword && (
            <span className="text-amber-500 dark:text-amber-400">Password required</span>
          )}
        </div>
      </div>

      {hasVoted ? (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
          <p className="text-green-800 dark:text-green-300 font-medium mb-3">You have already voted in this election.</p>
          <Link
            href={`/${id}/results`}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View Results
          </Link>
        </div>
      ) : (
        <VotePageClient
          pollId={id}
          options={options}
          allowWriteIn={poll.allowWriteIn}
          requiresPassword={requiresPassword}
          initialAccessGranted={accessGranted}
        />
      )}
    </div>
  );
}
