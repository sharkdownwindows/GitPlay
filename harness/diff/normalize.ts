import type { RepoState } from "../../src/core/types";
import type { RawGitState } from "./runReal";

export interface NormalizedState {
  commits: Record<string, string[]>;
  branches: Record<string, string>;
  head: { detached: false; ref: string } | { detached: true; commit: string };
}

interface SourceCommit { id: string; message: string; parents: string[] }

function normalize(
  commits: SourceCommit[], branches: Record<string, string>,
  head: { detached: false; ref: string } | { detached: true; commit: string },
): NormalizedState {
  const names = new Map<string, string>();
  for (const commit of commits) {
    if (names.has(commit.message)) throw new Error(`Duplicate commit message: ${commit.message}`);
    names.set(commit.message, commit.id);
  }
  const messages = new Map([...names].map(([message, id]) => [id, message]));
  const resolve = (id: string): string => {
    const message = messages.get(id);
    if (message === undefined) throw new Error(`Unresolved commit: ${id}`);
    return message;
  };
  const normalizedCommits: Record<string, string[]> = Object.create(null);
  for (const commit of [...commits].sort((a, b) => a.message.localeCompare(b.message))) {
    normalizedCommits[commit.message] = commit.parents.map(resolve);
  }
  const normalizedBranches: Record<string, string> = Object.create(null);
  for (const name of Object.keys(branches).sort()) normalizedBranches[name] = resolve(branches[name]!);
  if (!head.detached && commits.length > 0 && !Object.hasOwn(normalizedBranches, head.ref)) {
    throw new Error(`Unresolved HEAD branch: ${head.ref}`);
  }
  return {
    commits: normalizedCommits,
    branches: normalizedBranches,
    head: head.detached ? { detached: true, commit: resolve(head.commit) } : head,
  };
}

export function normalizeEngine(state: RepoState): NormalizedState {
  return normalize(Object.values(state.commits), state.branches,
    state.head.detached
      ? { detached: true, commit: state.head.commit ?? "" }
      : { detached: false, ref: state.head.ref ?? "" });
}

export function normalizeReal(state: RawGitState): NormalizedState {
  return normalize(state.commits.map((commit) => ({ id: commit.hash, message: commit.message, parents: commit.parents })),
    state.branches, state.head.detached
      ? { detached: true, commit: state.head.hash }
      : { detached: false, ref: state.head.ref });
}
