# Differential divergence log

## Execution policy

Execution policy: depth 2 on every pull request; depth 3 nightly for now. Nightly automation is not configured yet. The local Git process spike measured a 29.21 ms mean.
This corrected local depth-2 run took 712.8 seconds. Revisit the policy after the first GitHub CI run using Git 2.43.

Observed with git version 2.31.1.windows.1; fixed alphabet 15; seed 0; exhaustive suffix depth 2.
Fixtures: empty (setup 0), fork (setup 5). Setup commands do not count toward suffix depth.
Cases: 482; hard-failed cases: 0; distinct output warnings: 306.

Divergences are deduplicated by kind and minimal failing command prefix. Hard failures remain correctness defects.
Reproduce sequences through the typed harness adapter: synthetic cN commit targets are resolved to real Git hashes before invocation.
Soft warnings are accepted output-format differences; no code fix is required under the accepted contract.

The alphabet covers typed Tier 1 commands. Parser-only classes (NotGitCommand, UnknownSubcommand, MissingArgument), NothingToCommit, AlreadyOnBranch, BranchNotFullyMerged and UnknownCommand are outside this CLI gate.

## d1 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C2
```

Expected (Git):
```text
[main (root-commit) 42130ba] C2
```

Actual (GitScope):
```text
[main (root-commit) c1] C2
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d2 — output (soft)

Command sequence:
```text
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d3 — output (soft)

Command sequence:
```text
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d4 — output (soft)

Command sequence:
```text
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d5 — output (soft)

Command sequence:
```text
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d6 — output (soft)

Command sequence:
```text
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d7 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d8 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d9 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d10 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d11 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C2
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main a4a1d4e] C3
```

Actual (GitScope):
```text
[main c2] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d12 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C2
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d13 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C2
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d14 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C2
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d15 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C2
git checkout c1
```

Expected (Git):
```text
Note: switching to '5ea176c3edab9f8c7f5357b3a07ab4bab660904a'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 5ea176c C2
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d16 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C2
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d17 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C2
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d18 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C2
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d19 — output (soft)

Command sequence:
```text
git branch -- feature
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) 16c3a42] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d20 — output (soft)

Command sequence:
```text
git branch -- feature
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d21 — output (soft)

Command sequence:
```text
git branch -- feature
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d22 — output (soft)

Command sequence:
```text
git branch -- feature
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d23 — output (soft)

Command sequence:
```text
git branch -- feature
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d24 — output (soft)

Command sequence:
```text
git branch -- feature
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d25 — output (soft)

Command sequence:
```text
git branch -- feature
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d26 — output (soft)

Command sequence:
```text
git branch -- feature
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d27 — output (soft)

Command sequence:
```text
git branch -- feature
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d28 — output (soft)

Command sequence:
```text
git branch -- feature
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d29 — output (soft)

Command sequence:
```text
git branch
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) 5c88ce0] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d30 — output (soft)

Command sequence:
```text
git branch
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d31 — output (soft)

Command sequence:
```text
git branch
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d32 — output (soft)

Command sequence:
```text
git branch
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d33 — output (soft)

Command sequence:
```text
git branch
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d34 — output (soft)

Command sequence:
```text
git branch
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d35 — output (soft)

Command sequence:
```text
git branch
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d36 — output (soft)

Command sequence:
```text
git branch
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d37 — output (soft)

Command sequence:
```text
git branch
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d38 — output (soft)

Command sequence:
```text
git branch
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d39 — output (soft)

Command sequence:
```text
git branch -- --list
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) e9f0a1e] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d40 — output (soft)

Command sequence:
```text
git branch -- --list
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d41 — output (soft)

Command sequence:
```text
git branch -- --list
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d42 — output (soft)

Command sequence:
```text
git branch -- --list
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d43 — output (soft)

Command sequence:
```text
git branch -- --list
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d44 — output (soft)

Command sequence:
```text
git branch -- --list
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d45 — output (soft)

Command sequence:
```text
git branch -- --list
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d46 — output (soft)

Command sequence:
```text
git branch -- --list
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d47 — output (soft)

Command sequence:
```text
git branch -- --list
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d48 — output (soft)

Command sequence:
```text
git branch -- --list
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d49 — output (soft)

Command sequence:
```text
git switch -- main
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) dc64db2] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d50 — output (soft)

Command sequence:
```text
git switch -- main
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d51 — output (soft)

Command sequence:
```text
git switch -- main
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d52 — output (soft)

Command sequence:
```text
git switch -- main
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d53 — output (soft)

Command sequence:
```text
git switch -- main
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d54 — output (soft)

Command sequence:
```text
git switch -- main
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d55 — output (soft)

Command sequence:
```text
git switch -- main
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d56 — output (soft)

Command sequence:
```text
git switch -- main
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d57 — output (soft)

Command sequence:
```text
git switch -- main
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d58 — output (soft)

Command sequence:
```text
git switch -- main
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d59 — output (soft)

Command sequence:
```text
git switch -- feature
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) 8bac1d7] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d60 — output (soft)

Command sequence:
```text
git switch -- feature
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d61 — output (soft)

Command sequence:
```text
git switch -- feature
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d62 — output (soft)

Command sequence:
```text
git switch -- feature
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d63 — output (soft)

Command sequence:
```text
git switch -- feature
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d64 — output (soft)

Command sequence:
```text
git switch -- feature
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d65 — output (soft)

Command sequence:
```text
git switch -- feature
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d66 — output (soft)

Command sequence:
```text
git switch -- feature
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d67 — output (soft)

Command sequence:
```text
git switch -- feature
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d68 — output (soft)

Command sequence:
```text
git switch -- feature
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d69 — output (soft)

Command sequence:
```text
git switch -c topic
git commit --allow-empty -m C3
```

Expected (Git):
```text
[topic (root-commit) 9116bd5] C3
```

Actual (GitScope):
```text
[topic (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d70 — output (soft)

Command sequence:
```text
git switch -c topic
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'topic'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d71 — output (soft)

Command sequence:
```text
git switch -c topic
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d72 — output (soft)

Command sequence:
```text
git switch -c topic
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d73 — output (soft)

Command sequence:
```text
git switch -c topic
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d74 — output (soft)

Command sequence:
```text
git switch -c topic
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d75 — output (soft)

Command sequence:
```text
git switch -c topic
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d76 — output (soft)

Command sequence:
```text
git switch -c topic
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d77 — output (soft)

Command sequence:
```text
git switch -c topic
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d78 — output (soft)

Command sequence:
```text
git switch -c topic
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d79 — output (soft)

Command sequence:
```text
git switch -- --help
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) f89fc24] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d80 — output (soft)

Command sequence:
```text
git switch -- --help
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d81 — output (soft)

Command sequence:
```text
git switch -- --help
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d82 — output (soft)

Command sequence:
```text
git switch -- --help
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d83 — output (soft)

Command sequence:
```text
git switch -- --help
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d84 — output (soft)

Command sequence:
```text
git switch -- --help
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d85 — output (soft)

Command sequence:
```text
git switch -- --help
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d86 — output (soft)

Command sequence:
```text
git switch -- --help
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d87 — output (soft)

Command sequence:
```text
git switch -- --help
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d88 — output (soft)

Command sequence:
```text
git switch -- --help
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d89 — output (soft)

Command sequence:
```text
git checkout main
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) 111b31d] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d90 — output (soft)

Command sequence:
```text
git checkout main
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d91 — output (soft)

Command sequence:
```text
git checkout main
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d92 — output (soft)

Command sequence:
```text
git checkout main
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d93 — output (soft)

Command sequence:
```text
git checkout main
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d94 — output (soft)

Command sequence:
```text
git checkout main
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d95 — output (soft)

Command sequence:
```text
git checkout main
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d96 — output (soft)

Command sequence:
```text
git checkout main
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d97 — output (soft)

Command sequence:
```text
git checkout main
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d98 — output (soft)

Command sequence:
```text
git checkout main
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d99 — output (soft)

Command sequence:
```text
git checkout c1
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) c2e42e7] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d100 — output (soft)

Command sequence:
```text
git checkout c1
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d101 — output (soft)

Command sequence:
```text
git checkout c1
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d102 — output (soft)

Command sequence:
```text
git checkout c1
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d103 — output (soft)

Command sequence:
```text
git checkout c1
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d104 — output (soft)

Command sequence:
```text
git checkout c1
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d105 — output (soft)

Command sequence:
```text
git checkout c1
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d106 — output (soft)

Command sequence:
```text
git checkout c1
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d107 — output (soft)

Command sequence:
```text
git checkout c1
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d108 — output (soft)

Command sequence:
```text
git checkout c1
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d109 — output (soft)

Command sequence:
```text
git checkout -b topic
git commit --allow-empty -m C3
```

Expected (Git):
```text
[topic (root-commit) d08d9ff] C3
```

Actual (GitScope):
```text
[topic (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d110 — output (soft)

Command sequence:
```text
git checkout -b topic
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'topic'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d111 — output (soft)

Command sequence:
```text
git checkout -b topic
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d112 — output (soft)

Command sequence:
```text
git checkout -b topic
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d113 — output (soft)

Command sequence:
```text
git checkout -b topic
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d114 — output (soft)

Command sequence:
```text
git checkout -b topic
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d115 — output (soft)

Command sequence:
```text
git checkout -b topic
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d116 — output (soft)

Command sequence:
```text
git checkout -b topic
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d117 — output (soft)

Command sequence:
```text
git checkout -b topic
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d118 — output (soft)

Command sequence:
```text
git checkout -b topic
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d119 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) 4522822] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d120 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d121 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d122 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d123 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d124 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d125 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d126 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d127 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d128 — output (soft)

Command sequence:
```text
git checkout refs/heads/--help
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d129 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) ffd336b] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d130 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d131 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d132 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d133 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d134 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d135 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d136 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d137 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d138 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'main'" -- main
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d139 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) d1a7293] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d140 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d141 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d142 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d143 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d144 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d145 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d146 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d147 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d148 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'feature'" -- feature
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d149 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main (root-commit) 76ad92a] C3
```

Actual (GitScope):
```text
[main (root-commit) c1] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d150 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
git branch -- feature
```

Expected (Git):
```text
fatal: Not a valid object name: 'main'.
```

Actual (GitScope):
```text
fatal: your current branch does not have any commits yet
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d151 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d152 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
git switch -- main
```

Expected (Git):
```text
fatal: invalid reference: main
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d153 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
git switch -- feature
```

Expected (Git):
```text
fatal: invalid reference: feature
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d154 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d155 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d156 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
git merge -m "Merge branch 'main'" -- main
```

Expected (Git):
```text
merge: main - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'main' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d157 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
merge: feature - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'feature' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d158 — output (soft)

Command sequence:
```text
git merge -m "Merge branch 'missing'" -- missing
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d159 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
```

Expected (Git):
```text
[main (root-commit) 61213e4] C0
```

Actual (GitScope):
```text
[main (root-commit) c1] C0
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d160 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
```

Expected (Git):
```text
[feature 28312c2] C1
```

Actual (GitScope):
```text
[feature c2] C1
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d161 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git commit --allow-empty -m C2
```

Expected (Git):
```text
[main c6ae525] C2
```

Actual (GitScope):
```text
[main c3] C2
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d162 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d163 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d164 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d165 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d166 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
```

Expected (Git):
```text
Note: switching to '709f484447c124ddf8ce40756ca1d26634341e4f'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 709f484 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d167 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d168 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating 8426f03..cc68e16
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d169 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d170 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git commit --allow-empty -m C2
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main d112cb1] C3
```

Actual (GitScope):
```text
[main c4] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d171 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git commit --allow-empty -m C2
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d172 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git commit --allow-empty -m C2
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d173 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git commit --allow-empty -m C2
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d174 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git commit --allow-empty -m C2
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d175 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git commit --allow-empty -m C2
git checkout c1
```

Expected (Git):
```text
Note: switching to 'f15839003bb065b59e9a37cfd2fa377c6067a617'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at f158390 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d176 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git commit --allow-empty -m C2
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d177 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git commit --allow-empty -m C2
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Already up to date!
Merge made by the 'recursive' strategy.
```

Actual (GitScope):
```text
Merge made by the 'ort' strategy.
[c4] Merge branch 'feature'
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d178 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git commit --allow-empty -m C2
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d179 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- feature
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main 17cd53b] C3
```

Actual (GitScope):
```text
[main c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d180 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- feature
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d181 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- feature
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d182 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- feature
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d183 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- feature
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d184 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- feature
git checkout c1
```

Expected (Git):
```text
Note: switching to 'c97c872156738f022bea97c50934e89b24de12fe'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at c97c872 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d185 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- feature
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d186 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- feature
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating 32c9e74..a649260
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d187 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- feature
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d188 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main 27a07eb] C3
```

Actual (GitScope):
```text
[main c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d189 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d190 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d191 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d192 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d193 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch
git checkout c1
```

Expected (Git):
```text
Note: switching to '692990fb773af0e918c43d2ad1b401724256bc98'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 692990f C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d194 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d195 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating a6ce314..2ba8311
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d196 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d197 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- --list
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main 79f8bc4] C3
```

Actual (GitScope):
```text
[main c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d198 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- --list
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d199 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- --list
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d200 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- --list
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d201 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- --list
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d202 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- --list
git checkout c1
```

Expected (Git):
```text
Note: switching to 'caeb7a4b74b78d7447ba4b29c0c863adbf390d44'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at caeb7a4 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d203 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- --list
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d204 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- --list
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating b19f1ad..37d777c
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d205 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git branch -- --list
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d206 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- main
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main 3dc779e] C3
```

Actual (GitScope):
```text
[main c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d207 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- main
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d208 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- main
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d209 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- main
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d210 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- main
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d211 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- main
git checkout c1
```

Expected (Git):
```text
Note: switching to '726b5c9137e1a9a2a1d252ec6dbd123307a0a578'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 726b5c9 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d212 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- main
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d213 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- main
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating 92036ca..c841cc2
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d214 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- main
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d215 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- feature
git commit --allow-empty -m C3
```

Expected (Git):
```text
[feature 9f5bb35] C3
```

Actual (GitScope):
```text
[feature c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d216 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- feature
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d217 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- feature
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d218 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- feature
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d219 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- feature
git checkout c1
```

Expected (Git):
```text
Note: switching to '6acdf124cd12c01b4ca2fb4bd05c7ba2fdf442f8'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 6acdf12 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d220 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- feature
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d221 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- feature
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d222 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git commit --allow-empty -m C3
```

Expected (Git):
```text
[topic 7fab6ce] C3
```

Actual (GitScope):
```text
[topic c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d223 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d224 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git branch
```

Expected (Git):
```text
feature
  main
* topic
```

Actual (GitScope):
```text
  feature
  main
* topic
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d225 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d226 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git switch -c topic
```

Expected (Git):
```text
fatal: A branch named 'topic' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'topic' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d227 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d228 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git checkout c1
```

Expected (Git):
```text
Note: switching to 'd9084a31c1dddddd8c060f24bb17ad347df958ee'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at d9084a3 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d229 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git checkout -b topic
```

Expected (Git):
```text
fatal: A branch named 'topic' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'topic' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d230 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d231 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating 48f329d..0a4ba11
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d232 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -c topic
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d233 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- --help
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main 41f4438] C3
```

Actual (GitScope):
```text
[main c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d234 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- --help
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d235 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- --help
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d236 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- --help
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d237 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- --help
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d238 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- --help
git checkout c1
```

Expected (Git):
```text
Note: switching to '209c80a6999cfffe548d6cfa9a81f289d25a4a8b'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 209c80a C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d239 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- --help
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d240 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- --help
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating 8209c11..ea3f55d
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d241 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git switch -- --help
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d242 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout main
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main 18f83a1] C3
```

Actual (GitScope):
```text
[main c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d243 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout main
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d244 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout main
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d245 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout main
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d246 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout main
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d247 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout main
git checkout c1
```

Expected (Git):
```text
Note: switching to '25dfabe87f067643c0fa81ead8169a8471778cc4'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 25dfabe C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d248 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout main
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d249 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout main
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating eedb883..2bdffd8
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d250 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout main
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d251 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
git commit --allow-empty -m C3
```

Expected (Git):
```text
[detached HEAD 62743cf] C3
```

Actual (GitScope):
```text
[detached HEAD c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d252 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d253 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
git branch
```

Expected (Git):
```text
* (HEAD detached at c817a07)
  feature
  main
```

Actual (GitScope):
```text
  feature
  main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d254 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d255 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
git switch -- feature
```

Expected (Git):
```text
Previous HEAD position was 9ee1ca8 C0
Switched to branch 'feature'
```

Actual (GitScope):
```text
Switched to branch 'feature'
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d256 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d257 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
git checkout c1
```

Expected (Git):
```text
HEAD is now at 031e258 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d258 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d259 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating bb0e836..d9a5cb8
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d260 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout c1
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d261 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git commit --allow-empty -m C3
```

Expected (Git):
```text
[topic 08cc2f4] C3
```

Actual (GitScope):
```text
[topic c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d262 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d263 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git branch
```

Expected (Git):
```text
feature
  main
* topic
```

Actual (GitScope):
```text
  feature
  main
* topic
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d264 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d265 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git switch -c topic
```

Expected (Git):
```text
fatal: A branch named 'topic' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'topic' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d266 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d267 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git checkout c1
```

Expected (Git):
```text
Note: switching to '9162cf20c9f9b07959182a9c5407d1f274d09220'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 9162cf2 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d268 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git checkout -b topic
```

Expected (Git):
```text
fatal: A branch named 'topic' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'topic' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d269 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d270 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating fece0a0..e3a90a4
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d271 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout -b topic
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d272 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout refs/heads/--help
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main 0e10fdd] C3
```

Actual (GitScope):
```text
[main c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d273 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout refs/heads/--help
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d274 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout refs/heads/--help
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d275 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout refs/heads/--help
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d276 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout refs/heads/--help
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d277 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout refs/heads/--help
git checkout c1
```

Expected (Git):
```text
Note: switching to '093e50e55088f5f954dd6bc32680ecad55714bec'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 093e50e C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d278 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout refs/heads/--help
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d279 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout refs/heads/--help
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating f1ee5b8..cb5c8f4
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d280 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git checkout refs/heads/--help
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d281 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'main'" -- main
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main a090fa7] C3
```

Actual (GitScope):
```text
[main c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d282 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'main'" -- main
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d283 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'main'" -- main
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d284 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'main'" -- main
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d285 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'main'" -- main
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d286 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'main'" -- main
git checkout c1
```

Expected (Git):
```text
Note: switching to '9ea8b23727a970b548cfa038cd61da170837e046'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 9ea8b23 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d287 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'main'" -- main
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d288 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'main'" -- main
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating 961dc2f..3cff650
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d289 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'main'" -- main
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d290 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'feature'" -- feature
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main f903ba0] C3
```

Actual (GitScope):
```text
[main c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d291 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'feature'" -- feature
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d292 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'feature'" -- feature
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d293 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'feature'" -- feature
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d294 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'feature'" -- feature
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d295 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'feature'" -- feature
git checkout c1
```

Expected (Git):
```text
Note: switching to '40e5fe63b587a04932c179e8c8104c44498f7525'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 40e5fe6 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d296 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'feature'" -- feature
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d297 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'feature'" -- feature
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d298 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'missing'" -- missing
git commit --allow-empty -m C3
```

Expected (Git):
```text
[main 015cdc4] C3
```

Actual (GitScope):
```text
[main c3] C3
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d299 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'missing'" -- missing
git branch -- feature
```

Expected (Git):
```text
fatal: A branch named 'feature' already exists.
```

Actual (GitScope):
```text
fatal: a branch named 'feature' already exists
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d300 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'missing'" -- missing
git branch
```

Expected (Git):
```text
feature
* main
```

Actual (GitScope):
```text
  feature
* main
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d301 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'missing'" -- missing
git branch -- --list
```

Expected (Git):
```text
fatal: '--list' is not a valid branch name.
```

Actual (GitScope):
```text
fatal: invalid reference name
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d302 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'missing'" -- missing
git switch -- --help
```

Expected (Git):
```text
fatal: invalid reference: --help
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d303 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'missing'" -- missing
git checkout c1
```

Expected (Git):
```text
Note: switching to 'fa91392ccc4b1aa7e607368eb960afd178099d08'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at fa91392 C0
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d304 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'missing'" -- missing
git checkout refs/heads/--help
```

Expected (Git):
```text
error: pathspec 'refs/heads/--help' did not match any file(s) known to git
```

Actual (GitScope):
```text
error: pathspec '--help' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d305 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'missing'" -- missing
git merge -m "Merge branch 'feature'" -- feature
```

Expected (Git):
```text
Updating 822d5c7..56f0b8b
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## d306 — output (soft)

Command sequence:
```text
git commit --allow-empty -m C0
git branch -- feature
git switch -- feature
git commit --allow-empty -m C1
git checkout main
git merge -m "Merge branch 'missing'" -- missing
git merge -m "Merge branch 'missing'" -- missing
```

Expected (Git):
```text
merge: missing - not something we can merge
```

Actual (GitScope):
```text
error: pathspec 'missing' did not match any file(s) known to git
```

Cause: not established; accepted output-only difference.

Fixing commit: None; no code fix is required under the accepted contract.

## Entry template

Command sequence:
```text
git ...
```

Expected (Git):
```text
...
```

Actual (GitScope):
```text
...
```

Cause: To be established from a reproduction.

Fixing commit: Pending.
