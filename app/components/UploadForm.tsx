"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMinutes, formatISO } from "date-fns";
import { useState } from "react";

interface FormState {
  title: string;
  description: string;
  tags: string;
  sourceUrl: string;
  thumbnailUrl: string;
  playlistIds: string;
  visibility: "public" | "private" | "unlisted";
  scheduledTime: string;
  autoChapters: boolean;
  aiDescription: boolean;
}

const initialState = (): FormState => ({
  title: "",
  description: "",
  tags: "",
  sourceUrl: "",
  thumbnailUrl: "",
  playlistIds: "",
  visibility: "public",
  scheduledTime: formatISO(addMinutes(new Date(), 30)).slice(0, 16),
  autoChapters: true,
  aiDescription: true
});

async function createTask(payload: Record<string, unknown>) {
  const response = await fetch("/api/queue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create task");
  }
  return response.json();
}

export default function UploadForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      setForm(initialState());
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: (err: Error) => {
      setError(err.message);
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const playlistIds = form.playlistIds
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    mutation.mutate({
      title: form.title,
      description: form.description,
      tags,
      sourceUrl: form.sourceUrl,
      thumbnailUrl: form.thumbnailUrl || undefined,
      playlistIds: playlistIds.length ? playlistIds : undefined,
      visibility: form.visibility,
      scheduledTime: new Date(form.scheduledTime).toISOString(),
      autoChapters: form.autoChapters,
      aiDescription: form.aiDescription
    });
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = event.target;
    const { name, value } = target;
    const nextValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue
    }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 style={{ margin: 0 }}>Create Upload Task</h2>
          <p style={{ color: "var(--muted)", marginTop: "0.35rem" }}>
            Queue your next YouTube release with AI-assisted metadata and autopilot scheduling.
          </p>
        </div>
        <span className="badge">Autopilot Agent</span>
      </div>
      <form onSubmit={handleSubmit} className="grid">
        <div className="grid">
          <label htmlFor="title">Video Title</label>
          <input
            id="title"
            name="title"
            required
            placeholder="Enter a compelling title"
            value={form.title}
            onChange={handleChange}
          />
        </div>
        <div className="grid">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Outline the video, CTAs, and key points"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-row two">
          <div className="grid">
            <label htmlFor="sourceUrl">Source Video URL</label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              required
              placeholder="https://example.com/video.mp4"
              value={form.sourceUrl}
              onChange={handleChange}
            />
          </div>
          <div className="grid">
            <label htmlFor="thumbnailUrl">Thumbnail URL</label>
            <input
              id="thumbnailUrl"
              name="thumbnailUrl"
              type="url"
              placeholder="https://example.com/thumb.jpg"
              value={form.thumbnailUrl}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row two">
          <div className="grid">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input
              id="tags"
              name="tags"
              placeholder="tutorial, automation, ai"
              value={form.tags}
              onChange={handleChange}
            />
          </div>
          <div className="grid">
            <label htmlFor="playlistIds">Playlist IDs (comma separated)</label>
            <input
              id="playlistIds"
              name="playlistIds"
              placeholder="PLxxxxxxxx"
              value={form.playlistIds}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row two">
          <div className="grid">
            <label htmlFor="scheduledTime">Schedule</label>
            <input
              id="scheduledTime"
              name="scheduledTime"
              type="datetime-local"
              required
              value={form.scheduledTime}
              onChange={handleChange}
            />
          </div>
          <div className="grid">
            <label htmlFor="visibility">Visibility</label>
            <select id="visibility" name="visibility" value={form.visibility} onChange={handleChange}>
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="checkbox"
              name="autoChapters"
              checked={form.autoChapters}
              onChange={handleChange}
            />
            Enable automatic chapters when possible
          </label>
          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="checkbox"
              name="aiDescription"
              checked={form.aiDescription}
              onChange={handleChange}
            />
            Enhance descriptions with AI copy
          </label>
        </div>
        {error && (
          <div style={{ color: "#f87171", fontWeight: 600 }}>{error}</div>
        )}
        <div>
          <button className="button" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Scheduling…" : "Add to Autopilot Queue"}
          </button>
        </div>
      </form>
    </div>
  );
}
