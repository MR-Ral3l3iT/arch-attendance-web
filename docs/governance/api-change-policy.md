# API Change Policy

## Scope
Changes to endpoints, request/response shapes, auth payloads, and business rule semantics.

## Rules
1. Any API change must include update to central docs in `attendance-web/docs`.
2. Pull requests must explicitly mark impact using labels:
   - `api-change`
   - `web-impact`
   - `mobile-impact`
   - `breaking-change` (if incompatible)
3. Breaking changes require migration notes in PR body and release notes.
4. For breaking changes, require review from both web and mobile owners.

## Compatibility workflow
- Backend publishes release tag.
- Web/app reference minimum compatible backend tag in release note.
- If endpoint removal is needed, provide deprecation period first.
