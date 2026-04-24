// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
import CreatePollForm from "@/components/CreatePollForm";

export default function CreatePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create an Election</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Add your candidates and configure the election. You&apos;ll receive a password to manage it.
        </p>
      </div>
      <CreatePollForm />
    </div>
  );
}
