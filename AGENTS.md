# Codex Policy (Repository Local)

## 1) Minimize Questions
- Default: execute directly without extra confirmation questions.
- Ask only when:
  - requirements conflict and lead to materially different outcomes,
  - an operation is destructive or hard to recover,
  - required input is missing and execution is blocked.
- Otherwise, apply conservative defaults and state assumptions briefly.

## 2) Safety First
- Do not perform system-damaging operations.
- Disallowed examples:
  - destructive cleanup/reset (`rm -rf`, `git reset --hard`, `format`, `del /s /q`)
  - force push or risky history rewrite (`git push --force`, unsafe rebase)
  - broad permission changes (`chmod -R`, `chown -R`)
  - reading secrets/private keys (`~/.ssh`, `~/.aws`, direct `.env` dump)

## 3) Execution Defaults
- Prefer read/search/verify workflows first (`rg`, file listing, file reads, tests).
- Keep writes scoped to requested files and minimal diffs.
- Do not modify tool-specific configs (for example `.claude/*`) unless explicitly requested.

## 4) Reporting
- Keep completion reports short: changed files, key diffs, verification results.
- If blocked, report cause and the safest next option.
