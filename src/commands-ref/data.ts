import type { RepoState } from "../core/types";

export interface CommandRef {
  syntax: string;
  summary: string;
  effect: string;
  before: RepoState;
  after: RepoState;
  gotcha: string;
}

export const commandRefs: Record<string, CommandRef> = {
  commit: {
    syntax: "git commit -m \"message\"",
    summary: "Create a new commit from the current HEAD.",
    effect: "A new commit is created and the current branch or detached HEAD moves to it.",
    before: {
      commits: {
        C1: {
          id: "C1",
          message: "Initial commit",
          parents: [],
          timestamp: "2026-01-01T00:00:00Z",
        },
      },
      branches: {
        main: "C1",
      },
      head: {
        detached: true,
        ref: null,
        commit: "C1",
      },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    },
    after: {
      commits: {
        C1: {
          id: "C1",
          message: "Initial commit",
          parents: [],
          timestamp: "2026-01-01T00:00:00Z",
        },
        C2: {
          id: "C2",
          message: "New commit",
          parents: ["C1"],
          timestamp: "2026-01-01T00:01:00Z",
        },
      },
      branches: {
        main: "C1",
      },
      head: {
        detached: true,
        ref: null,
        commit: "C2",
      },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    },
    gotcha: "When HEAD is detached, the new commit does not belong to any branch.",
  },

  branch: {
    syntax: "git branch <name>",
    summary: "Create a new branch at the current commit.",
    effect: "A new branch name is added without changing HEAD.",
    before: {
      commits: {
        C1: {
          id: "C1",
          message: "Initial commit",
          parents: [],
          timestamp: "2026-01-01T00:00:00Z",
        },
      },
      branches: {
        main: "C1",
      },
      head: {
        detached: false,
        ref: "main",
        commit: null,
      },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    },
    after: {
      commits: {
        C1: {
          id: "C1",
          message: "Initial commit",
          parents: [],
          timestamp: "2026-01-01T00:00:00Z",
        },
      },
      branches: {
        main: "C1",
        feature: "C1",
      },
      head: {
        detached: false,
        ref: "main",
        commit: null,
      },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    },
    gotcha: "Creating a branch does not switch to it.",
  },

  switch: {
    syntax: "git switch <branch>",
    summary: "Switch HEAD to another branch.",
    effect: "HEAD becomes attached to the selected branch.",
    before: {
      commits: {
        C1: {
          id: "C1",
          message: "Initial commit",
          parents: [],
          timestamp: "2026-01-01T00:00:00Z",
        },
        C2: {
          id: "C2",
          message: "Feature commit",
          parents: ["C1"],
          timestamp: "2026-01-01T00:01:00Z",
        },
      },
      branches: {
        main: "C1",
        feature: "C2",
      },
      head: {
        detached: false,
        ref: "main",
        commit: null,
      },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    },
    after: {
      commits: {
        C1: {
          id: "C1",
          message: "Initial commit",
          parents: [],
          timestamp: "2026-01-01T00:00:00Z",
        },
        C2: {
          id: "C2",
          message: "Feature commit",
          parents: ["C1"],
          timestamp: "2026-01-01T00:01:00Z",
        },
      },
      branches: {
        main: "C1",
        feature: "C2",
      },
      head: {
        detached: false,
        ref: "feature",
        commit: null,
      },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    },
    gotcha: "git switch refuses to switch directly to a commit; use git checkout for detached HEAD.",
  },

  checkout: {
    syntax: "git checkout <target>",
    summary: "Switch to a branch or check out a specific commit.",
    effect: "HEAD attaches to a branch or becomes detached at a commit.",
    before: {
      commits: {
        C1: {
          id: "C1",
          message: "Initial commit",
          parents: [],
          timestamp: "2026-01-01T00:00:00Z",
        },
        C2: {
          id: "C2",
          message: "Second commit",
          parents: ["C1"],
          timestamp: "2026-01-01T00:01:00Z",
        },
      },
      branches: {
        main: "C2",
      },
      head: {
        detached: false,
        ref: "main",
        commit: null,
      },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    },
    after: {
      commits: {
        C1: {
          id: "C1",
          message: "Initial commit",
          parents: [],
          timestamp: "2026-01-01T00:00:00Z",
        },
        C2: {
          id: "C2",
          message: "Second commit",
          parents: ["C1"],
          timestamp: "2026-01-01T00:01:00Z",
        },
      },
      branches: {
        main: "C2",
      },
      head: {
        detached: true,
        ref: null,
        commit: "C1",
      },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    },
    gotcha: "Checking out a commit instead of a branch leaves HEAD detached.",
  },

  merge: {
    syntax: "git merge <branch>",
    summary: "Merge another branch into the current branch.",
    effect: "The current branch moves to the other branch in a fast-forward merge.",
    before: {
      commits: {
        C1: {
          id: "C1",
          message: "Initial commit",
          parents: [],
          timestamp: "2026-01-01T00:00:00Z",
        },
        C2: {
          id: "C2",
          message: "Feature commit",
          parents: ["C1"],
          timestamp: "2026-01-01T00:01:00Z",
        },
      },
      branches: {
        main: "C1",
        feature: "C2",
      },
      head: {
        detached: false,
        ref: "main",
        commit: null,
      },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    },
    after: {
      commits: {
        C1: {
          id: "C1",
          message: "Initial commit",
          parents: [],
          timestamp: "2026-01-01T00:00:00Z",
        },
        C2: {
          id: "C2",
          message: "Feature commit",
          parents: ["C1"],
          timestamp: "2026-01-01T00:01:00Z",
        },
      },
      branches: {
        main: "C2",
        feature: "C2",
      },
      head: {
        detached: false,
        ref: "main",
        commit: null,
      },
      snapshot: null,
      workingTree: null,
      index: null,
      conflicts: null,
    },
    gotcha: "A fast-forward merge does not create a new commit.",
  },
};