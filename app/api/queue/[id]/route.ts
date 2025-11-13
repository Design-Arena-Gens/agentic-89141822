import { NextResponse } from "next/server";
import { z } from "zod";
import { rescheduleTask, removeTask } from "@/lib/automation";
import { updateTask } from "@/lib/queueStore";
import { VideoTask } from "@/lib/types";

const updateSchema = z
  .object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    tags: z.array(z.string()).optional(),
    visibility: z.enum(["public", "unlisted", "private"]).optional(),
    scheduledTime: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().optional(),
    playlistIds: z.array(z.string()).optional(),
    autoChapters: z.boolean().optional(),
    aiDescription: z.boolean().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    if (data.scheduledTime) {
      const updated = await rescheduleTask(params.id, new Date(data.scheduledTime).toISOString());
      return updated
        ? NextResponse.json({ task: updated })
        : NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    type AllowedUpdates = Partial<Omit<VideoTask, "id" | "createdAt" | "updatedAt" | "status" | "error" >>;
    const { scheduledTime: _unusedScheduled, ...rest } = data;
    void _unusedScheduled;
    const updates = rest as AllowedUpdates;
    const updated = await updateTask(params.id, updates);
    return updated
      ? NextResponse.json({ task: updated })
      : NextResponse.json({ error: "Task not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const removed = await removeTask(params.id);
  return removed
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: "Task not found" }, { status: 404 });
}
