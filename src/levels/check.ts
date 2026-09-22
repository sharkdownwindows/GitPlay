import type { RepoState } from "../core/types";

export function canon(
  state: RepoState,
  id: string,
  memo: Map<string, string>
): string {
  if (memo.has(id)) {
    return memo.get(id)!;
  }

  const parents = state.commits[id]!.parents;

  const label =
    parents.length === 0
      ? "()"
      : "(" +
        parents
          .map((parent) => canon(state, parent, memo))
          .sort()
          .join(",") +
        ")";

  memo.set(id, label);
  return label;
}

export function checkGoal(state: RepoState, goal: RepoState): boolean {
  const stateBranches = Object.keys(state.branches);
  const goalBranches = Object.keys(goal.branches);

  if (stateBranches.length !== goalBranches.length) {
    return false;
  }

  for (const branch of stateBranches) {
    if (!(branch in goal.branches)) {
      return false;
    }
  }

  const stateMemo = new Map<string, string>();
  const goalMemo = new Map<string, string>();

  for (const branch of stateBranches) {
  const stateCommit = state.branches[branch]!;
  const goalCommit = goal.branches[branch]!;

  if (
    canon(state, stateCommit, stateMemo) !==
    canon(goal, goalCommit, goalMemo)
  ) {
    return false;
  }
}

  if (state.head.detached !== goal.head.detached) {
    return false;
  }

  if (!state.head.detached) {
    return state.head.ref === goal.head.ref;
  }

  if (state.head.commit === null || goal.head.commit === null) {
    return state.head.commit === goal.head.commit;
  }

  return (
    canon(state, state.head.commit, stateMemo) ===
    canon(goal, goal.head.commit, goalMemo)
  );
}