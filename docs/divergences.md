# Differential divergence log

## Run metadata

Commit SHA: 37eddcade0522c00866f1d8616f59d3eef64189c
Git version: git version 2.31.1.windows.1
Seed: 42
Exhaustive depth: 2
Cases: 133
Hard failures: 0
Output warnings: 50
Alphabet size: 15
Fixtures: empty (setup 0), fork (setup 5)

Setup commands do not count toward exhaustive depth. Output warnings are a soft gate.

## Hard divergences

No hard divergences observed; no harness-detected hard divergence has a verified fixing commit.

## Soft output differences

### branch (10 warnings)

Representative command sequence:
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

Grouped by the command producing the output difference; other wording may differ within this group.

### checkout (12 warnings)

Representative command sequence:
```text
git commit --allow-empty -m C2
git checkout c1
```

Expected (Git):
```text
Note: switching to 'fe71579b64908a49e729cc8cbb0071543d5b8fa7'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c <new-branch-name>

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at fe71579 C2
```

Actual (GitScope):
```text
Note: switching to 'c1'.
You are in 'detached HEAD' state.
```

Grouped by the command producing the output difference; other wording may differ within this group.

### commit (18 warnings)

Representative command sequence:
```text
git commit --allow-empty -m C2
```

Expected (Git):
```text
[main (root-commit) ccfbe27] C2
```

Actual (GitScope):
```text
[main (root-commit) c1] C2
```

Grouped by the command producing the output difference; other wording may differ within this group.

### merge (9 warnings)

Representative command sequence:
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
Updating b8555c5..716f188
Fast-forward (no commit created; -m option ignored)
```

Actual (GitScope):
```text
Updating c1..c2
Fast-forward
```

Grouped by the command producing the output difference; other wording may differ within this group.

### switch (1 warnings)

Representative command sequence:
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
Previous HEAD position was 867fe10 C0
Switched to branch 'feature'
```

Actual (GitScope):
```text
Switched to branch 'feature'
```

Grouped by the command producing the output difference; other wording may differ within this group.
