import AutomationStatus from "./AutomationStatus";
import QueueTable from "./QueueTable";
import RunAgentButton from "./RunAgentButton";
import UploadForm from "./UploadForm";

export default function AgentDashboard() {
  return (
    <div className="container">
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <div style={{ display: "inline-flex", gap: "0.75rem", alignItems: "center" }}>
          <span className="badge">AI Ops</span>
          <h1 style={{ margin: 0, fontSize: "2.8rem" }}>YouTube Autopilot Control</h1>
        </div>
        <p style={{ color: "var(--muted)", marginTop: "0.75rem", maxWidth: "640px", marginInline: "auto" }}>
          Automate uploads, schedule releases, and orchestrate your YouTube content pipeline.
          Integrate with your asset sources, enhance metadata with AI, and let the autopilot agent
          publish on your behalf.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <RunAgentButton />
        </div>
      </header>
      <div className="grid grid-cols-2" style={{ marginBottom: "2rem" }}>
        <UploadForm />
        <AutomationStatus />
      </div>
      <QueueTable />
    </div>
  );
}
