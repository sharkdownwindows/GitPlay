import type { RepoState } from "../core/types";

export interface Level {
  id: string;
  title: string;
  description: string;
  initial: RepoState;
  goal: RepoState;
  hint?: string;
}