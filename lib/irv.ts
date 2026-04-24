// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
export interface Round {
  tally: Record<string, number>;
  eliminated: string[];
  exhausted: number;
}

export interface IRVResult {
  winner: string | null;
  rounds: Round[];
}

/**
 * Run Instant Runoff Voting on a set of ballots.
 * @param ballots - Array of ballots, each being an ordered list of candidate names (most preferred first)
 * @param options - The official candidate list (write-ins may appear in ballots but not here)
 */
export function runIRV(ballots: string[][], options: string[]): IRVResult {
  const rounds: Round[] = [];
  let remaining = new Set(options);

  // Include any write-in candidates that appear in ballots
  for (const ballot of ballots) {
    for (const name of ballot) {
      remaining.add(name);
    }
  }

  while (remaining.size > 0) {
    // Count first-choice votes among remaining candidates
    const tally: Record<string, number> = {};
    for (const c of remaining) tally[c] = 0;
    let exhausted = 0;

    for (const ballot of ballots) {
      const choice = ballot.find((c) => remaining.has(c));
      if (choice) {
        tally[choice]++;
      } else {
        exhausted++;
      }
    }

    const totalActive = Object.values(tally).reduce((a, b) => a + b, 0);

    // Check for majority winner
    for (const [candidate, votes] of Object.entries(tally)) {
      if (totalActive > 0 && votes / totalActive > 0.5) {
        rounds.push({ tally, eliminated: [], exhausted });
        return { winner: candidate, rounds };
      }
    }

    // Only one candidate left — they win by default
    if (remaining.size === 1) {
      const candidate = [...remaining][0];
      rounds.push({ tally, eliminated: [], exhausted });
      return { winner: candidate, rounds };
    }

    // Find the minimum vote count
    const minVotes = Math.min(...Object.values(tally));

    // Eliminate all tied-last candidates
    const eliminated = Object.entries(tally)
      .filter(([, v]) => v === minVotes)
      .map(([c]) => c);

    // If eliminating everyone, it's a complete tie
    if (eliminated.length === remaining.size) {
      rounds.push({ tally, eliminated, exhausted });
      return { winner: null, rounds };
    }

    rounds.push({ tally, eliminated, exhausted });
    for (const c of eliminated) remaining.delete(c);
  }

  return { winner: null, rounds };
}
