import dynamic from "next/dynamic";

const AgentDashboard = dynamic(() => import("./components/AgentDashboard"), {
  ssr: false
});

export default function Page() {
  return <AgentDashboard />;
}
