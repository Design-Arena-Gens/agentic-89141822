"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

async function runAgent() {
  const response = await fetch("/api/agent/run", { method: "POST" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to run agent");
  }
  return response.json();
}

export default function RunAgentButton() {
  const [toast, setToast] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: runAgent,
    onSuccess: () => {
      setToast("Agent run completed");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["agent-status"] });
    },
    onError: (error: Error) => {
      setToast(error.message);
    }
  });

  return (
    <div style={{ position: "relative" }}>
      <button
        className="button"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "Running Agent…" : "Run Autopilot Now"}
      </button>
      {toast && (
        <div
          className="toast"
          role="status"
          onAnimationEnd={() => setToast(null)}
          style={{ animation: "fadeout 6s forwards" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
