import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Better decisions through ranked choice voting
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
          Create an election, share it with your group, and let everyone rank their preferences.
          The most broadly supported option wins.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/create"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Create an Election
          </Link>
          <Link
            href="/elections"
            className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            View Open Elections
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              title: "Create an election",
              body: "Add a title, list your candidates, and optionally set a deadline or require a voter password. You'll receive an admin password to manage the election.",
            },
            {
              step: "2",
              title: "Voters rank candidates",
              body: "Share the election link. Voters drag candidates into their preferred order — most to least preferred. Each person submits one ballot.",
            },
            {
              step: "3",
              title: "Instant runoff determines the winner",
              body: "Once the election closes, Instant Runoff Voting eliminates the last-place candidate each round until one candidate holds a majority.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold mb-3">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Features</h2>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
          {[
            { label: "No accounts needed", desc: "Voters don't need to sign up. One vote per browser is enforced automatically." },
            { label: "Password-protected voting", desc: "Optionally require a voter password so only invited participants can cast a ballot." },
            { label: "Public or private elections", desc: "Choose whether your election appears on the public listing or stays accessible only by direct link." },
            { label: "Write-in candidates", desc: "Allow voters to add their own candidates to the ballot." },
            { label: "Round-by-round results", desc: "See exactly how each elimination round played out, not just the final winner." },
            { label: "Admin dashboard", desc: "Manage candidates, adjust settings, review all submitted ballots, and close or delete the election at any time." },
          ].map(({ label, desc }) => (
            <div key={label} className="px-5 py-4 flex gap-4">
              <svg className="shrink-0 mt-0.5 text-indigo-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-8 bg-indigo-50 dark:bg-indigo-950 rounded-xl border border-indigo-100 dark:border-indigo-900">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Ready to run an election?</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">It takes under a minute to set up.</p>
        <Link
          href="/create"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Create an Election
        </Link>
      </div>
    </div>
  );
}
