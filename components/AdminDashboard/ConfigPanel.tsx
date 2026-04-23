"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls = "w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500";

interface Props {
  pollId: string;
  title: string;
  description: string;
  status: string;
  allowWriteIn: boolean;
  deadline: string | null;
  visible: boolean;
  hasVoterPassword: boolean;
}

export default function ConfigPanel(props: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(props.title);
  const [description, setDescription] = useState(props.description);
  const [status, setStatus] = useState(props.status);
  const [allowWriteIn, setAllowWriteIn] = useState(props.allowWriteIn);
  const [deadline, setDeadline] = useState(props.deadline ? props.deadline.slice(0, 16) : "");
  const [visible, setVisible] = useState(props.visible);
  const [voterPassword, setVoterPassword] = useState("");
  const [clearPassword, setClearPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      // voterPassword field: empty string = no change, non-empty = set new, clearPassword = remove
      const voterPasswordPayload = clearPassword
        ? ""           // empty string signals removal
        : voterPassword || undefined; // undefined = no change

      const res = await fetch(`/api/polls/${props.pollId}/admin/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, status, allowWriteIn, deadline: deadline || null,
          visible, voterPassword: voterPasswordPayload,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to save."); return; }
      setSaved(true);
      setVoterPassword("");
      setClearPassword(false);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
        Configuration
      </h2>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={allowWriteIn} onChange={(e) => setAllowWriteIn(e.target.checked)} className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
            Allow write-in candidates
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" />
            Show on public elections listing
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Voter password
            {props.hasVoterPassword && !clearPassword && (
              <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400">currently set</span>
            )}
          </label>
          {!clearPassword ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={voterPassword}
                onChange={(e) => setVoterPassword(e.target.value)}
                placeholder={props.hasVoterPassword ? "Enter new password to change…" : "Leave blank for open voting"}
                className={inputCls}
              />
              {props.hasVoterPassword && (
                <button type="button" onClick={() => setClearPassword(true)} className="shrink-0 text-sm text-red-500 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors whitespace-nowrap">
                  Remove
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-red-600 dark:text-red-400">Password will be removed on save.</span>
              <button type="button" onClick={() => setClearPassword(false)} className="text-gray-500 dark:text-gray-400 hover:underline">Undo</button>
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">If set, voters must enter this password before they can rank candidates.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
