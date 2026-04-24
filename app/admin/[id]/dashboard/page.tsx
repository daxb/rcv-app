// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin";
import CandidateManager from "@/components/AdminDashboard/CandidateManager";
import ConfigPanel from "@/components/AdminDashboard/ConfigPanel";
import BallotReview from "@/components/AdminDashboard/BallotReview";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const authed = await isAdminAuthenticated(id);
  if (!authed) redirect(`/admin/${id}`);

  const poll = await prisma.poll.findUnique({
    where: { id },
    include: { ballots: true },
  });
  if (!poll) notFound();

  const options = JSON.parse(poll.options) as string[];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Link href="/elections" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
          ← All elections
        </Link>
        <div className="flex gap-3 text-sm">
          <Link href={`/${id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Vote page
          </Link>
          <Link href={`/${id}/results`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Results
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{poll.title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      <div className="space-y-6">
        <ConfigPanel
          pollId={id}
          title={poll.title}
          description={poll.description}
          status={poll.status}
          allowWriteIn={poll.allowWriteIn}
          deadline={poll.deadline?.toISOString() ?? null}
          visible={poll.visible}
          hasVoterPassword={poll.voterPasswordHash != null}
        />
        <CandidateManager pollId={id} options={options} />
        <BallotReview pollId={id} ballotCount={poll.ballots.length} />
      </div>
    </div>
  );
}
