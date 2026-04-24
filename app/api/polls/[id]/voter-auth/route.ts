// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setVoterAccess } from "@/lib/voter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { password } = (await req.json()) as { password: string };

  const poll = await prisma.poll.findUnique({
    where: { id },
    select: { voterPasswordHash: true },
  });
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  if (!poll.voterPasswordHash) return NextResponse.json({ error: "No password required" }, { status: 400 });

  const valid = await bcrypt.compare(password, poll.voterPasswordHash);
  if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

  await setVoterAccess(id);
  return NextResponse.json({ success: true });
}
