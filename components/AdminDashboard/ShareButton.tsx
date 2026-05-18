// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
"use client";

import { useState } from "react";

export default function ShareButton({
  pollId,
  title,
}: {
  pollId: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/${pollId}`;
    // Prefer the native share sheet (mobile); fall back to clipboard.
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Vote in "${title}"`, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy the vote page link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="text-indigo-600 dark:text-indigo-400 hover:underline"
    >
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}
