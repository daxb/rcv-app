// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800 p-6">
      <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{error.message}</p>
      {error.digest && (
        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-4">
          digest: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
