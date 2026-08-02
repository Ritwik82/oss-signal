import { NextResponse } from "next/server";
import { getProjects } from "@/lib/data";

const SAFE_PARAM = /^[A-Za-z0-9._-]+$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  if (!SAFE_PARAM.test(owner) || !SAFE_PARAM.test(repo)) {
    return NextResponse.json({ error: "invalid owner or repo" }, { status: 400 });
  }
  const data = getProjects();
  const project = data.projects.find(
    (p) => p.owner === owner && p.name === repo
  );
  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(project);
}
