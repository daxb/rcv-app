import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      options: true,
      status: true,
      allowWriteIn: true,
      deadline: true,
      createdAt: true,
      _count: { select: { ballots: true } },
    },
  });

  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...poll,
    options: JSON.parse(poll.options) as string[],
    ballotCount: poll._count.ballots,
  });
}
