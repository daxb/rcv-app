import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateVoterToken, hasVoterAccess } from "@/lib/voter";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const poll = await prisma.poll.findUnique({ where: { id } });
  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }
  if (poll.status === "closed") {
    return NextResponse.json({ error: "Poll is closed" }, { status: 403 });
  }
  if (poll.deadline && new Date() > poll.deadline) {
    return NextResponse.json({ error: "Poll deadline has passed" }, { status: 403 });
  }
  if (poll.voterPasswordHash && !(await hasVoterAccess(id))) {
    return NextResponse.json({ error: "Voter password required" }, { status: 403 });
  }

  const body = await req.json();
  const { rankings } = body as { rankings: string[] };

  if (!Array.isArray(rankings) || rankings.length === 0) {
    return NextResponse.json({ error: "Rankings are required" }, { status: 400 });
  }

  const voterToken = await getOrCreateVoterToken();

  const existing = await prisma.ballot.findUnique({
    where: { pollId_voterToken: { pollId: id, voterToken } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  await prisma.ballot.create({
    data: { pollId: id, rankings: JSON.stringify(rankings), voterToken },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
