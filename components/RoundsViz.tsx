import type { Round } from "@/lib/irv";

interface Props {
  rounds: Round[];
  options: string[];
}

export default function RoundsViz({ rounds, options }: Props) {
  if (rounds.length === 0) return null;

  const allCandidates = Array.from(new Set(rounds.flatMap((r) => Object.keys(r.tally))));
  const eliminated = new Set<string>();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Round-by-Round Results
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left px-4 py-2 font-medium text-gray-600 dark:text-gray-400">Candidate</th>
              {rounds.map((_, i) => (
                <th key={i} className="text-center px-3 py-2 font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  Round {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allCandidates.map((candidate) => {
              const isOriginal = options.includes(candidate);
              return (
                <tr key={candidate} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">
                    {candidate}
                    {!isOriginal && (
                      <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">(write-in)</span>
                    )}
                  </td>
                  {rounds.map((round, i) => {
                    const votes = round.tally[candidate];
                    const wasEliminated = round.eliminated.includes(candidate);
                    if (i === rounds.length - 1 && wasEliminated) eliminated.add(candidate);
                    const isEliminated = eliminated.has(candidate) && !wasEliminated;
                    const total = Object.values(round.tally).reduce((a, b) => a + b, 0);
                    const pct = total > 0 && votes != null ? ((votes / total) * 100).toFixed(0) : null;

                    return (
                      <td
                        key={i}
                        className={`text-center px-3 py-2.5 tabular-nums ${
                          wasEliminated
                            ? "text-red-500 bg-red-50 dark:bg-red-950/40"
                            : isEliminated
                            ? "text-gray-300 dark:text-gray-600"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {votes != null ? (
                          <span>
                            {votes}
                            {pct != null && <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({pct}%)</span>}
                            {wasEliminated && <span className="ml-1 text-xs">✕</span>}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rounds.some((r) => r.exhausted > 0) && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
          Exhausted ballots:{" "}
          {rounds.map((r, i) => (
            <span key={i}>Round {i + 1}: {r.exhausted}{i < rounds.length - 1 ? ", " : ""}</span>
          ))}
        </div>
      )}
    </div>
  );
}
