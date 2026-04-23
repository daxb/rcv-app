import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin";

// GET /api/polls/[id]/admin/ballots — list all ballots (admin only)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAdminAuthenticated(id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ballots = await prisma.ballot.findMany({
    where: { pollId: id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rankings: true,
      voterToken: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    ballots.map((b) => ({
      ...b,
      rankings: JSON.parse(b.rankings) as string[],
      // Truncate voter token for display privacy
      voterToken: b.voterToken.slice(0, 8) + "...",
    }))
  );
}

// DELETE /api/polls/[id]/admin/ballots — delete the poll entirely
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAdminAuthenticated(id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.poll.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
