"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";

interface QueueTask {
  id: string;
  title: string;
  description: string;
  tags: string[];
  visibility: string;
  scheduledTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  playlistIds?: string[];
  thumbnailUrl?: string;
  sourceUrl: string;
  error?: string | null;
}

async function fetchQueue() {
  const response = await fetch("/api/queue");
  if (!response.ok) {
    throw new Error("Failed to load queue");
  }
  return response.json();
}

async function deleteTask(id: string) {
  const response = await fetch(`/api/queue/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
  return response.json();
}

async function rescheduleTask(id: string, scheduledTime: string) {
  const response = await fetch(`/api/queue/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scheduledTime })
  });
  if (!response.ok) {
    throw new Error("Failed to reschedule task");
  }
  return response.json();
}

export default function QueueTable() {
  const queryClient = useQueryClient();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState<string>("");

  const queueQuery = useQuery<{ queue: QueueTask[] }>({
    queryKey: ["queue"],
    queryFn: fetchQueue
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    }
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, scheduledTime }: { id: string; scheduledTime: string }) =>
      rescheduleTask(id, scheduledTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      setEditingTaskId(null);
    }
  });

  const queue = queueQuery.data?.queue ?? [];

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 style={{ margin: 0 }}>Autopilot Queue</h2>
          <p style={{ color: "var(--muted)", marginTop: "0.35rem" }}>
            Track scheduled uploads, monitor status, and manage your automation pipeline.
          </p>
        </div>
      </div>
      {queue.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No videos scheduled yet. Create one to get started.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{task.title}</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                      {task.visibility.toUpperCase()} · Created {format(new Date(task.createdAt), "MMM d, HH:mm")}
                    </div>
                  </td>
                  <td>
                    {editingTaskId === task.id ? (
                      <div className="actions">
                        <input
                          type="datetime-local"
                          value={newSchedule}
                          onChange={(event) => setNewSchedule(event.target.value)}
                        />
                      <button
                        className="action-button"
                        onClick={() =>
                            newSchedule &&
                            rescheduleMutation.mutate({
                              id: task.id,
                              scheduledTime: new Date(newSchedule).toISOString()
                            })
                          }
                      >
                          Save
                        </button>
                        <button className="action-button" onClick={() => setEditingTaskId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        {format(new Date(task.scheduledTime), "MMM d, yyyy · HH:mm")}
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                          Updated {format(new Date(task.updatedAt), "MMM d, HH:mm")}
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`status-chip status-${task.status}`}>
                      {task.status}
                    </span>
                    {task.error && (
                      <div style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        {task.error}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="tag-list">
                      {task.tags.map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <a
                      href={task.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary)", fontSize: "0.85rem" }}
                    >
                      Asset
                    </a>
                    {task.thumbnailUrl && (
                      <div>
                        <a
                          href={task.thumbnailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--primary)", fontSize: "0.75rem" }}
                        >
                          Thumbnail
                        </a>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="action-button"
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setNewSchedule(task.scheduledTime.slice(0, 16));
                        }}
                      >
                        Reschedule
                      </button>
                      <button
                        className="action-button"
                        onClick={() => deleteMutation.mutate(task.id)}
                        style={{ color: "#f87171" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
