import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setAdminSession, isAdminAuthenticated, clearAdminSession } from "@/lib/admin";

// POST /api/polls/[id]/admin — verify password and set session
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { password } = (await req.json()) as { password: string };

  const poll = await prisma.poll.findUnique({
    where: { id },
    select: { adminHash: true },
  });
  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, poll.adminHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await setAdminSession(id);
  return NextResponse.json({ success: true });
}

// DELETE /api/polls/[id]/admin — log out
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAdminAuthenticated(id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await clearAdminSession(id);
  return NextResponse.json({ success: true });
}
