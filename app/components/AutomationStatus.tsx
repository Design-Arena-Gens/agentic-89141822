"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface AgentState {
  lastRun: string | null;
  lastRunStatus: "idle" | "success" | "error";
  lastError: string | null;
  totalRuns: number;
  totalUploads: number;
  totalFailures: number;
}

interface QueueTask {
  status: "pending" | "uploading" | "uploaded" | "failed";
}

async function fetchStatus() {
  const response = await fetch("/api/agent/status");
  if (!response.ok) {
    throw new Error("Failed to fetch status");
  }
  return response.json() as Promise<{ queue: QueueTask[]; state: AgentState }>;
}

export default function AutomationStatus() {
  const { data } = useQuery({
    queryKey: ["agent-status"],
    queryFn: fetchStatus,
    refetchInterval: 15000
  });

  const pending = data?.queue.filter((task) => task.status === "pending").length ?? 0;
  const uploading = data?.queue.filter((task) => task.status === "uploading").length ?? 0;
  const failed = data?.queue.filter((task) => task.status === "failed").length ?? 0;
  const uploaded = data?.state.totalUploads ?? 0;

  const lastRunText = data?.state.lastRun
    ? `${formatDistanceToNow(new Date(data.state.lastRun), { addSuffix: true })}`
    : "No runs yet";

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 style={{ margin: 0 }}>Automation Health</h2>
          <p style={{ color: "var(--muted)", marginTop: "0.35rem" }}>
            Visibility into the last autopilot cycle and overall delivery performance.
          </p>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Pending Uploads</div>
          <div className="stat-value">{pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{uploading}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Delivered</div>
          <div className="stat-value">{uploaded}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Failures</div>
          <div className="stat-value">{failed}</div>
        </div>
      </div>
      <div style={{ marginTop: "1.5rem" }}>
        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Last run</div>
        <div style={{ fontWeight: 600, marginTop: "0.35rem" }}>{lastRunText}</div>
        {data?.state.lastError && (
          <div style={{ color: "#f87171", marginTop: "0.5rem" }}>{data.state.lastError}</div>
        )}
      </div>
    </div>
  );
}
