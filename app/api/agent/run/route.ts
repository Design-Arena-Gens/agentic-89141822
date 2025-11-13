import { NextResponse } from "next/server";
import { runAutomation } from "@/lib/automation";
import { recordError } from "@/lib/agentStateStore";

export async function POST() {
  try {
    const result = await runAutomation();
    return NextResponse.json(result);
  } catch (error) {
    const message = (error as Error).message;
    await recordError(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
