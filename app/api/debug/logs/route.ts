// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
//
// Token-gated debug endpoint: reads the app's stderr/stdout log files from
// disk and returns the tail of each. Exists because Hostinger does not expose
// these logs in hPanel and their docs are vague about the exact path.
//
// Usage: /api/debug/logs?token=<LOG_ACCESS_TOKEN>
//        /api/debug/logs?token=<...>&file=<absolute-path>  (read any single file)
//        /api/debug/logs?token=<...>&lines=500             (tail length override)
//
// If LOG_ACCESS_TOKEN is not set in the environment, the endpoint returns 404.
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import * as path from "path";

export const dynamic = "force-dynamic";

const DEFAULT_TAIL_LINES = 300;
const MAX_TAIL_BYTES = 1_000_000; // read at most last 1 MB of any log

// Candidate paths for stderr.log / stdout.log — Hostinger Managed Node.js
// does not document the location precisely, so we probe several likely spots.
function candidatePaths(cwd: string): string[] {
  const parents = [
    cwd,
    path.resolve(cwd, ".."),
    path.resolve(cwd, "../.."),
    path.resolve(cwd, "../../.."),
    "/home",
  ];
  const files = ["stderr.log", "stdout.log", "error.log", "nodejs.log", "app.log"];
  const set = new Set<string>();
  for (const p of parents) {
    for (const f of files) set.add(path.join(p, f));
  }
  // Hostinger-shaped guesses that don't depend on cwd
  set.add("/home/u142321725/domains/rcv.verdantcoast.com/stderr.log");
  set.add("/home/u142321725/domains/rcv.verdantcoast.com/public_html/stderr.log");
  set.add("/home/u142321725/logs/stderr.log");
  set.add("/home/u142321725/nodejs/stderr.log");
  return [...set];
}

async function tailFile(filepath: string, lines: number): Promise<{ size: number; tail: string }> {
  const stat = await fs.stat(filepath);
  const size = stat.size;
  const readFrom = Math.max(0, size - MAX_TAIL_BYTES);
  const fh = await fs.open(filepath, "r");
  try {
    const buf = Buffer.alloc(size - readFrom);
    await fh.read(buf, 0, buf.length, readFrom);
    const text = buf.toString("utf8");
    const allLines = text.split("\n");
    const tail = allLines.slice(-lines).join("\n");
    return { size, tail };
  } finally {
    await fh.close();
  }
}

export async function GET(req: NextRequest) {
  const expected = process.env.LOG_ACCESS_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";
  if (token !== expected) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const lines = Math.min(Math.max(parseInt(searchParams.get("lines") ?? "", 10) || DEFAULT_TAIL_LINES, 1), 5000);
  const singleFile = searchParams.get("file");
  const cwd = process.cwd();

  if (singleFile) {
    try {
      const { size, tail } = await tailFile(singleFile, lines);
      return new NextResponse(tail || "(empty)", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8", "x-log-size": String(size) },
      });
    } catch (e) {
      return NextResponse.json(
        { error: "Could not read file", path: singleFile, detail: e instanceof Error ? e.message : String(e) },
        { status: 404 }
      );
    }
  }

  const report: {
    cwd: string;
    argv: string[];
    nodeVersion: string;
    env: { NODE_ENV: string | null; PORT: string | null };
    candidates: Array<{ path: string; exists: boolean; size?: number; tail?: string; error?: string }>;
    cwdListing?: string[];
    parentListing?: string[];
  } = {
    cwd,
    argv: process.argv,
    nodeVersion: process.version,
    env: {
      NODE_ENV: process.env.NODE_ENV ?? null,
      PORT: process.env.PORT ?? null,
    },
    candidates: [],
  };

  for (const p of candidatePaths(cwd)) {
    try {
      const { size, tail } = await tailFile(p, lines);
      report.candidates.push({ path: p, exists: true, size, tail });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // only record files that exist-but-failed; skip plain ENOENT for brevity
      if (!msg.includes("ENOENT")) {
        report.candidates.push({ path: p, exists: false, error: msg });
      }
    }
  }

  try {
    report.cwdListing = await fs.readdir(cwd);
  } catch (e) {
    report.cwdListing = [`(cwd unreadable: ${e instanceof Error ? e.message : String(e)})`];
  }
  try {
    report.parentListing = await fs.readdir(path.resolve(cwd, ".."));
  } catch (e) {
    report.parentListing = [`(parent unreadable: ${e instanceof Error ? e.message : String(e)})`];
  }

  return NextResponse.json(report, { status: 200 });
}
