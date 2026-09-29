# Differential divergence log

## Run metadata

Commit SHA: a7aa37722b32e74af0c658bfb43dea6419e5c6e8
Git version: git version 2.31.1.windows.1
Seed: 0
Exhaustive depth: 2
Cases: 482
Hard failures: 0
Output warnings: 306
Alphabet size: 15
Fixtures: empty (setup 0), fork (setup 5)

Setup commands do not count toward exhaustive depth. Output warnings are a soft gate.

## Hard divergences

No hard divergences observed; no harness-detected hard divergence has a verified fixing commit.

## Soft output differences

### branch (78 warnings)

Representative command sequence:
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

Grouped by the command producing the output difference; other wording may differ within this group.

### checkout (51 warnings)

Representative command sequence:
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

Grouped by the command producing the output difference; other wording may differ within this group.

### commit (34 warnings)

Representative command sequence:
```text
git commit --allow-empty -m C2
```

Expected (Git):
```text
[main (root-commit) d1e1527] C2
```

Actual (GitScope):
```text
[main (root-commit) c1] C2
```

Grouped by the command producing the output difference; other wording may differ within this group.

### merge (77 warnings)

Representative command sequence:
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

Grouped by the command producing the output difference; other wording may differ within this group.

### switch (66 warnings)

Representative command sequence:
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

Grouped by the command producing the output difference; other wording may differ within this group.
