// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "640px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#b91c1c" }}>
          Application error
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#374151", marginTop: "0.5rem" }}>
          {error.message}
        </p>
        {error.digest && (
          <p style={{ fontSize: "0.75rem", color: "#6b7280", fontFamily: "monospace", marginTop: "0.5rem" }}>
            digest: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
