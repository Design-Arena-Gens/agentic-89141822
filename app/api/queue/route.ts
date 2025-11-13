import { NextResponse } from "next/server";
import { z } from "zod";
import { addTask, getQueue } from "@/lib/queueStore";

const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  tags: z.array(z.string()).default([]),
  visibility: z.enum(["public", "unlisted", "private"]),
  scheduledTime: z.coerce.date().transform((value) => value.toISOString()),
  sourceUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  playlistIds: z.array(z.string()).optional(),
  autoChapters: z.boolean().default(false),
  aiDescription: z.boolean().default(false)
});

export async function GET() {
  const queue = await getQueue();
  return NextResponse.json({ queue });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createTaskSchema.parse(json);
    const task = await addTask(parsed);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
