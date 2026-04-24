// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin";
import AdminLoginForm from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const poll = await prisma.poll.findUnique({
    where: { id },
    select: { id: true, title: true },
  });
  if (!poll) notFound();

  const authed = await isAdminAuthenticated(id);
  if (authed) redirect(`/admin/${id}/dashboard`);

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Admin Login</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Enter the password for &ldquo;{poll.title}&rdquo;
      </p>
      <AdminLoginForm pollId={id} />
    </div>
  );
}
