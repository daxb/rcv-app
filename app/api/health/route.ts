// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    hasDbUrl: Boolean(process.env.DATABASE_URL),
    hasCookieSecret: Boolean(process.env.COOKIE_SECRET),
    nodeEnv: process.env.NODE_ENV ?? null,
  };

  let dbOk = false;
  let dbError: string | undefined;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (e) {
    dbError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
  }

  return NextResponse.json(
    { ok: dbOk && env.hasDbUrl, env, db: { ok: dbOk, error: dbError } },
    { status: dbOk ? 200 : 503 }
  );
}
