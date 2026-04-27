# GitHub Repositories Setup

## Target repositories
- `attendance-api`
- `attendance-web`
- `attendance-app`

## Ownership and permissions (recommended)

- Team `core-admin`: `admin` on all repos
- Team `backend`: `maintain` on `attendance-api`, `triage` on others
- Team `frontend-web`: `maintain` on `attendance-web`, `triage` on others
- Team `mobile`: `maintain` on `attendance-app`, `triage` on others

## Branch protections (main)
- Require pull request before merging
- Require 1+ approval
- Require status check `CI`
- Dismiss stale approvals on new commits

## Local initialization checklist

For repos not initialized yet:

```bash
git init
git branch -M main
git add .
git commit -m "chore: bootstrap repository"
```

Then connect remote:

```bash
git remote add origin git@github.com:<org>/<repo>.git
git push -u origin main
```
