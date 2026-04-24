// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin";
import bcrypt from "bcryptjs";

// PUT /api/polls/[id]/admin/config — update poll config
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAdminAuthenticated(id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    title?: string;
    description?: string;
    status?: string;
    allowWriteIn?: boolean;
    deadline?: string | null;
    visible?: boolean;
    voterPassword?: string | null; // empty string = remove, null = no change, string = set new
  };

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.description !== undefined) data.description = body.description.trim();
  if (body.status === "open" || body.status === "closed") data.status = body.status;
  if (body.allowWriteIn !== undefined) data.allowWriteIn = body.allowWriteIn;
  if (body.visible !== undefined) data.visible = body.visible;
  if (body.deadline !== undefined) {
    data.deadline = body.deadline ? new Date(body.deadline) : null;
  }
  if (body.voterPassword !== undefined) {
    data.voterPasswordHash = body.voterPassword
      ? await bcrypt.hash(body.voterPassword, 10)
      : null;
  }

  const poll = await prisma.poll.update({ where: { id }, data });
  return NextResponse.json({ ...poll, options: JSON.parse(poll.options) });
}
