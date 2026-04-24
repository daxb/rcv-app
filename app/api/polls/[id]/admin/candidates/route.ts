// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin";

// POST /api/polls/[id]/admin/candidates — add a candidate
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAdminAuthenticated(id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = (await req.json()) as { name: string };
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const poll = await prisma.poll.findUnique({ where: { id } });
  if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const options: string[] = JSON.parse(poll.options);
  if (options.includes(name.trim())) {
    return NextResponse.json({ error: "Candidate already exists" }, { status: 409 });
  }

  options.push(name.trim());
  await prisma.poll.update({ where: { id }, data: { options: JSON.stringify(options) } });
  return NextResponse.json({ options }, { status: 201 });
}

// DELETE /api/polls/[id]/admin/candidates — remove a candidate by name
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAdminAuthenticated(id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = (await req.json()) as { name: string };
  const poll = await prisma.poll.findUnique({ where: { id } });
  if (!poll) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const options: string[] = JSON.parse(poll.options);
  const filtered = options.filter((o) => o !== name);
  if (filtered.length < 2) {
    return NextResponse.json(
      { error: "Poll must have at least 2 candidates" },
      { status: 400 }
    );
  }

  await prisma.poll.update({ where: { id }, data: { options: JSON.stringify(filtered) } });
  return NextResponse.json({ options: filtered });
}
