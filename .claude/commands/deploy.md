---
description: Deploy PBA to network share using deploy.bat
---

# PBA Deployment

## Current Branch

!`git branch --show-current`

---

## Deployment Script Execution

!`cd Plugins && deploy.bat 2>&1`

---

## Deployment Report

### Deployment Summary

- **Branch**: [Current branch from git]
- **Target**: `\\10.29.177.152\D\Deployment\{branch}`
- **Status**: ✅ Success / ❌ Failed
- **Timestamp**: [Current date/time]

### Branch-Specific Behavior

Analyze based on current branch:

**If branch is `devel`**:
- Deployment target: `\\10.29.177.152\D\Deployment\devel`
- Auto-upgrade: Portal at http://10.29.177.165:2971/pba/launcher/startProcess
- Purpose: Development testing

**If branch is `test`**:
- Deployment target: `\\10.29.177.152\D\Deployment\test`
- Auto-upgrade: STAGE/SEED portal at http://10.29.177.164:2971/pba/launcher/startProcess
- Purpose: Staging/integration testing

**If branch is `master` or `demo`**:
- Deployment target: `\\10.29.177.152\D\Deployment\{branch}`
- Configuration: Initializes branch-specific configuration files
- Purpose: Production or demo environment

### Deployed Components

Confirm these were deployed (based on output):

**Core Services**:
- [ ] pba-webserver (Port 1971)
- [ ] pba-launcher (Port 2971)
- [ ] pba-taskmanager (Port 1970)
- [ ] pba-playlist
- [ ] pba-recorder
- [ ] pba-watchdog
- [ ] pba-caster-grid (Port 3000)

**Supporting Services**:
- [ ] pba-web (Angular UI)
- [ ] pba-config
- [ ] pba-tray
- [ ] pba-fsw (File system watcher)
- [ ] pba-log
- [ ] pba-http
- [ ] pba-http-api

**Plugins**: (43 active plugins)
- [ ] plugins directory with all DLLs

**Database**:
- [ ] patch (SQL DbPatch scripts)

### Deployment Errors (if any)

List any errors encountered:
- Missing source directories
- Network path unavailable
- Permission issues
- File lock conflicts

## Post-Deployment Actions

### Automatic (based on branch):

**devel branch**:
- ✅ Curl command sent to http://10.29.177.165:2971/pba/launcher/startProcess
- ✅ Services will auto-restart with new binaries

**test branch**:
- ✅ Curl command sent to http://10.29.177.164:2971/pba/launcher/startProcess
- ✅ STAGE/SEED services will auto-restart

### Manual verification needed:

- [ ] Verify services started successfully
- [ ] Check service health endpoints
- [ ] Verify log files for startup errors: `c:\pba\log\`
- [ ] Test critical API endpoints
- [ ] Verify database connectivity
- [ ] Check SignalR hub connections

## Verification Commands

```bash
# Check service health (after deployment auto-restart)
curl http://10.29.177.165:1971/health  # webserver (devel)
curl http://10.29.177.165:1970/health  # taskmanager (devel)
curl http://10.29.177.165:2971/health  # launcher (devel)

# Or use the service-health command
# (Note: Run this AFTER services restart)
```

## Rollback Procedure (if deployment fails)

1. **Stop affected services** via launcher or manually
2. **Restore previous deployment** from backup (if available)
3. **Restart services** via launcher startProcess endpoint
4. **Verify services operational** via health endpoints
5. **Investigate deployment issue** before retry

## Common Deployment Issues

**Issue**: Network path not found
- **Cause**: Not connected to network or wrong VPN
- **Fix**: Verify network connectivity to 10.29.177.152

**Issue**: Access denied
- **Cause**: Insufficient permissions
- **Fix**: Check Windows credentials for network share access

**Issue**: File in use errors
- **Cause**: Services still running, holding file locks
- **Fix**: Stop services before deployment (via launcher or manually)

**Issue**: Missing publish directory
- **Cause**: Build didn't complete or failed
- **Fix**: Run `build.bat` first to populate c:\pba\.publish\

## Deployment Prerequisites

Before deploying, ensure:
- [ ] Build completed successfully (`build.bat`)
- [ ] Tests passed (if applicable)
- [ ] Code committed to git (deployment uses current branch)
- [ ] Services can be stopped/restarted (no critical broadcasts)
- [ ] Database migrations applied (if schema changes)
- [ ] Network share accessible (\\10.29.177.152\D\Deployment\)

## Notes

- Deployment copies from `c:\pba\.publish\` to network share
- Current branch determines deployment target
- Auto-upgrade only for devel and test branches
- Master/demo deployments require manual service restart
- Plugins are deployed as single directory (all 43 together)
