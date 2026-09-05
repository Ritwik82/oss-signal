import successorsData from "../../data/successors.json";

export interface SuccessorEntry {
  original_repo: string;
  original_name: string;
  successor_repo: string;
  successor_name: string;
  reason: string;
  migration_type: "fork_handoff" | "successor" | "upgrade" | "rebrand";
}

const successors: SuccessorEntry[] = successorsData as SuccessorEntry[];

export function getAllSuccessors(): SuccessorEntry[] {
  return successors;
}

export function getSuccessor(repoOrId: string | null | undefined): SuccessorEntry | null {
  if (!repoOrId) return null;
  const normalized = repoOrId.toLowerCase().trim();
  return (
    successors.find(
      (s) =>
        s.original_repo.toLowerCase() === normalized ||
        s.original_name.toLowerCase() === normalized ||
        s.original_repo.split("/")[1]?.toLowerCase() === normalized
    ) ?? null
  );
}

export function getObtainiumAddUrl(repo: string): string {
  return `obtainium://add/https://github.com/${repo}`;
}
