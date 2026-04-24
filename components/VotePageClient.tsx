// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
"use client";

import { useState } from "react";
import RankingBallot from "@/components/RankingBallot";
import VoterPasswordGate from "@/components/VoterPasswordGate";

interface Props {
  pollId: string;
  options: string[];
  allowWriteIn: boolean;
  requiresPassword: boolean;
  initialAccessGranted: boolean;
}

export default function VotePageClient({
  pollId,
  options,
  allowWriteIn,
  requiresPassword,
  initialAccessGranted,
}: Props) {
  const [accessGranted, setAccessGranted] = useState(initialAccessGranted);

  if (requiresPassword && !accessGranted) {
    return (
      <VoterPasswordGate
        pollId={pollId}
        onSuccess={() => setAccessGranted(true)}
      />
    );
  }

  return (
    <RankingBallot pollId={pollId} options={options} allowWriteIn={allowWriteIn} />
  );
}
