// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Verdant Coast LLC — https://verdantcoast.com
"use client";

import { useState } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";

function SortableItem({ id, rank }: { id: string; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 bg-white dark:bg-gray-900 border rounded-lg px-4 py-3 select-none ${
        isDragging
          ? "border-indigo-400 shadow-lg z-10 opacity-90"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 w-5 text-center">{rank}</span>
      <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{id}</span>
      <span
        {...attributes}
        {...listeners}
        className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing px-1"
        aria-label="Drag to reorder"
      >
        ⠿
      </span>
    </div>
  );
}

interface Props {
  pollId: string;
  options: string[];
  allowWriteIn: boolean;
}

export default function RankingBallot({ pollId, options, allowWriteIn }: Props) {
  const router = useRouter();
  const [ranked, setRanked] = useState<string[]>(options);
  const [writeIn, setWriteIn] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRanked((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function addWriteIn() {
    const name = writeIn.trim();
    if (!name || ranked.includes(name)) return;
    setRanked([...ranked, name]);
    setWriteIn("");
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankings: ranked }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Failed to submit vote."); return; }
      router.push(`/polls/${pollId}/results`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Drag candidates to rank them — most preferred at the top.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ranked} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {ranked.map((item, i) => (
              <SortableItem key={item} id={item} rank={i + 1} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {allowWriteIn && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={writeIn}
            onChange={(e) => setWriteIn(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addWriteIn())}
            placeholder="Add write-in candidate…"
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={addWriteIn}
            disabled={!writeIn.trim()}
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium"
      >
        {submitting ? "Submitting…" : "Submit Ballot"}
      </button>
    </div>
  );
}
