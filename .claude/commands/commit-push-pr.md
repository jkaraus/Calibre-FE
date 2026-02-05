---
description: Complete git workflow - stage changes, commit with conventional message, push to remote, and create a pull request
---

# Git Context

!`git status --short`
!`git branch --show-current`
!`git log -3 --oneline`
!`git diff --stat`

---

Based on the changes above, execute the full git workflow:

## 1. Stage Changes

Stage all modified files appropriately.

**Note**: Be careful not to stage appsettings*.json files (they contain secrets and are in .gitignore).

## 2. Commit

Create a commit with a **conventional commit** message adapted for PBA:

**Conventional Commit Types**:
- `feat(service):` - New feature in a service (e.g., `feat(webserver): add schedule export endpoint`)
- `feat(plugin):` - New plugin or plugin feature (e.g., `feat(plugin): add BBC metadata import`)
- `fix(service):` - Bug fix in a service (e.g., `fix(playlist): resolve schedule overlap calculation`)
- `fix(plugin):` - Bug fix in a plugin
- `docs:` - Documentation only (CLAUDE.md, README, etc.)
- `style:` - Code formatting, no functional change
- `refactor(service):` - Code restructuring, no behavior change
- `perf(service):` - Performance improvement
- `test(service):` - Adding or fixing tests
- `chore:` - Maintenance, dependencies, build scripts
- `build:` - Build system changes (build.bat, deploy.bat, .csproj)
- `ci:` - CI/CD configuration

**Format**: `type(scope): description`

**PBA-Specific Scopes**:
- Services: `webserver`, `taskmanager`, `launcher`, `playlist`, `recorder`, `watchdog`, `caster`, `gateway`
- Infrastructure: `db`, `core`, `microservice`, `api`
- Plugins: `plugin/{name}` or just `plugin`
- Build: `build`, `deploy`

**Examples**:
```
feat(webserver): add REST endpoint for emergency broadcast activation
fix(playlist): correct timecode calculation for media files
refactor(db): extract schedule query logic to repository pattern
perf(webserver): optimize schedule query with index hint
test(taskmanager): add unit tests for cron job scheduling
chore(deps): update NLog to 6.0.2 across all services
build(deploy): add new plugin to deployment script
docs(claude): update CLAUDE.md with plugin development guide
```

Keep the first line under 72 characters. Add a body if the change needs explanation.

**Body Format** (if needed):
```
feat(webserver): add emergency broadcast activation endpoint

- New POST /pba/emergency/activate endpoint
- SignalR notification to all connected clients
- Database priority flag on SchedItem
- Follows pattern from polsatEmergency.lib plugin

Closes #123

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## 3. Push

Push to the remote repository. Create the remote branch if needed.

**Important**: Current branch is often `devel` (not `main`). Push to current branch unless creating feature branch.

## 4. Create PR

Use `gh pr create` to open a pull request with:

- Clear, descriptive title matching commit message
- Body explaining what changed and why
- Link to related issues if applicable
- Target base branch (usually `master` for PBA, check git log for confirmation)

```bash
gh pr create --base master --title "feat(webserver): add emergency broadcast activation" --body "## Summary
- Added POST /pba/emergency/activate endpoint for emergency broadcast override
- Implements SignalR notification to all connected playout services
- Database writes use custom ORM (pba.db) pattern
- Follows established pattern from polsatEmergency.lib plugin

## PBA Architecture Impact
- Services affected: pba.webserver
- Plugins affected: None
- Database changes: None (uses existing SchedItem.Priority and IsEmergency columns)
- Legacy code: None
- Blast radius: 1 service out of 117 projects

## Testing
- Manual testing: Verified POST endpoint accepts EmergencyDto
- Manual testing: Verified SignalR broadcast to connected clients
- Manual testing: Verified database write with correct priority
- Build verification: build.bat completed successfully
- No automated tests (service layer not currently unit tested)

## CLAUDE.md Compliance
- [✓] No code modifications without approval - approved by user
- [✓] No public API changes - additive endpoint only
- [✓] Database changes scripted - none required
- [✓] Minimizes blast radius - single service

## Deployment Notes
- No deployment script changes needed
- Service restart required to load new endpoint
- Compatible with running services (additive change)

## Related
Closes #123

🤖 Generated with Claude Code
"
```

**PBA-Specific PR Body Template**:

```markdown
## Summary
- [Bullet points describing changes]

## PBA Architecture Impact
- Services affected: [List]
- Plugins affected: [List or None]
- Database changes: [Describe or None]
- Legacy code: [v4.6 projects touched or None]
- Blast radius: [X out of 117 projects]

## Testing
- [How it was tested - manual, automated, integration]
- [Build verification results]
- [Service startup verification]

## CLAUDE.md Compliance
- [✓/✗] No code modifications without approval
- [✓/✗] No public API changes (or approved)
- [✓/✗] Database changes scripted and reversible
- [✓/✗] Minimizes blast radius

## Deployment Notes
- [Any special deployment considerations]
- [Service restarts required?]
- [Database migrations needed?]
- [Backward compatibility concerns?]

## Related
- Closes #123 (if applicable)

🤖 Generated with Claude Code
```

If there are no changes to commit, inform the user and suggest next steps.

## Git Safety (PBA-Specific)

**NEVER** commit:
- `appsettings.json` or `appsettings.*.json` (contains JWT secrets, DB connection strings)
- `*.user` files (Visual Studio user settings)
- `bin/` or `obj/` directories
- `*.suo` files

**ALWAYS** check before pushing to `master` or `devel`:
- Verify you're on the correct branch
- No force-push to master/devel (protected in deny list)
- Changes don't break running broadcast services
