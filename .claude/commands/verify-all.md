---
description: Run complete verification suite for PBA - build, tests, format check
---

# Complete Verification Suite (PBA .NET)

## Solution Build

!`cd Plugins && build.bat 2>&1 | tail -40 || echo "BUILD: FAILED - Check output above"`

## Test Suite (if tests exist)

!`dotnet test pba.web.sln --no-build --verbosity normal 2>&1 | tail -30 || echo "TESTS: No tests found or failed"`

## Code Formatting Check (optional)

!`dotnet format pba.web.sln --verify-no-changes --verbosity diagnostic 2>&1 | tail -15 || echo "FORMAT: Not checked (dotnet format not configured or issues found)"`

---

## Verification Report

Summarize results in this format:

| Check       | Status | Details                                  |
| ----------- | ------ | ---------------------------------------- |
| Build       | ✅/❌  | Success / Failed at [project/location]   |
| Tests       | ✅/❌  | X passing, Y failing / Not configured    |
| Format      | ✅/❌  | Clean / X files need formatting / N/A    |

## Overall Status

**Ready to commit?**

- [ ] ✅ All checks pass - safe to commit
- [ ] ⚠️ Warnings only - consider fixing before commit
- [ ] ❌ Failures - MUST fix before commit (broadcast quality requirement)

## Detailed Results

### Build Analysis

- Total projects: 117
- Projects built: [X]
- Build errors: [List critical errors]
- Build warnings: [List if significant]

### Test Analysis (if applicable)

- Test projects found: [List]
- Total tests: [X]
- Passed: [X]
- Failed: [List failures with details]
- Skipped: [X]

## Recommended Actions

If failures exist, list them in priority order with suggested fixes:

1. **Critical**: [e.g., "pba.webserver compilation error in ScheduleController.cs:45"]
   - **Fix**: [Suggested fix]
   - **Impact**: [Services affected]

2. **Warning**: [e.g., "Nullable reference warning in pba.db"]
   - **Fix**: [Suggested fix or "Safe to ignore"]

If all pass:

✅ **All verification checks passed!**

Ready for next steps:
- Create commit: Use `/commit-push-pr` command
- Deploy to test: Use `/deploy` command
- Manual testing: Start services and verify endpoints

## PBA-Specific Checks

- [ ] Custom ORM initialization (pba.db.Global.Initialize) present in modified services?
- [ ] NLog configuration correct in new/modified services?
- [ ] SignalR hubs configured if real-time updates added?
- [ ] No appsettings.json files modified (secrets protection)?
- [ ] Deployment scripts updated (deploy.bat) if new service/plugin added?

## Notes

- Build output is from `Plugins/build.bat` (custom dotnet-script automation)
- Build artifacts published to `c:\pba\.publish\`
- Tests run with `--no-build` to use build output
- Format check is optional (not all projects have dotnet-format configured)
