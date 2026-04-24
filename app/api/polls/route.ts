// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { setAdminSession } from "@/lib/admin";

// GET /api/polls — list open, visible polls
export async function GET() {
  const polls = await prisma.poll.findMany({
    where: { status: "open", visible: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      options: true,
      deadline: true,
      allowWriteIn: true,
      voterPasswordHash: true,
      createdAt: true,
      _count: { select: { ballots: true } },
    },
  });

  return NextResponse.json(
    polls.map((p) => ({
      ...p,
      options: JSON.parse(p.options) as string[],
      ballotCount: p._count.ballots,
      hasVoterPassword: p.voterPasswordHash != null,
      voterPasswordHash: undefined,
    }))
  );
}

// POST /api/polls — create a new poll
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, options, deadline, allowWriteIn, visible, voterPassword } = body as {
    title: string;
    description?: string;
    options: string[];
    deadline?: string;
    allowWriteIn?: boolean;
    visible?: boolean;
    voterPassword?: string;
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!Array.isArray(options) || options.filter((o) => o.trim()).length < 2) {
    return NextResponse.json(
      { error: "At least 2 candidates required" },
      { status: 400 }
    );
  }

  const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
  const plainPassword = randomBytes(4).toString("hex"); // 8 hex chars
  const adminHash = await bcrypt.hash(plainPassword, 10);
  const voterPasswordHash = voterPassword?.trim()
    ? await bcrypt.hash(voterPassword.trim(), 10)
    : null;

  const poll = await prisma.poll.create({
    data: {
      title: title.trim(),
      description: (description ?? "").trim(),
      options: JSON.stringify(cleanOptions),
      deadline: deadline ? new Date(deadline) : null,
      allowWriteIn: allowWriteIn ?? false,
      visible: visible ?? true,
      adminHash,
      voterPasswordHash,
    },
  });

  await setAdminSession(poll.id);

  return NextResponse.json(
    { id: poll.id, adminPassword: plainPassword },
    { status: 201 }
  );
}
