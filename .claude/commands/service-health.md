---
description: Check health status of all PBA microservices
---

# PBA Service Health Check

## Webserver (1971)

!`curl -s -m 5 http://localhost:1971/health 2>&1 || echo "❌ Webserver not responding or /health endpoint not configured"`

## Taskmanager (1970)

!`curl -s -m 5 http://localhost:1970/health 2>&1 || echo "❌ Taskmanager not responding or /health endpoint not configured"`

## Launcher (2971)

!`curl -s -m 5 http://localhost:2971/health 2>&1 || echo "❌ Launcher not responding or /health endpoint not configured"`

## Caster Grid (3000)

!`curl -s -m 5 http://localhost:3000/health 2>&1 || echo "❌ Caster Grid not responding or /health endpoint not configured"`

## Running Processes

!`tasklist | findstr /i "pba" 2>&1 || echo "No PBA processes found running"`

---

## Health Report

Summarize service status in table format:

| Service       | Port | Status    | Response Time | Details                     |
| ------------- | ---- | --------- | ------------- | --------------------------- |
| Webserver     | 1971 | ✅/❌/⚠️  | Xms / N/A     | [Response or error message] |
| Taskmanager   | 1970 | ✅/❌/⚠️  | Xms / N/A     | [Response or error message] |
| Launcher      | 2971 | ✅/❌/⚠️  | Xms / N/A     | [Response or error message] |
| Caster Grid   | 3000 | ✅/❌/⚠️  | Xms / N/A     | [Response or error message] |

**Status Legend**:
- ✅ Healthy - Service responding correctly
- ❌ Down - Service not responding or error
- ⚠️ Degraded - Service responding but with warnings

## Process Status

List PBA processes currently running:

```
[List from tasklist output]
```

**Expected processes**:
- pba.webserver.exe
- pba.taskmanager.exe
- pba.launcher.exe
- pba.playlist.exe (if configured)
- pba.recorder.exe (if configured)
- pba.watchdog.exe (if configured)
- pba.caster.grid.exe (if configured)

## Overall System Health

**Status**: ✅ All Critical Services Up / ⚠️ Some Services Down / ❌ System Degraded

### Critical Services (must be running):
- [ ] pba.webserver (central API server)
- [ ] pba.launcher (service orchestrator)

### Important Services (should be running):
- [ ] pba.taskmanager (job execution)
- [ ] pba.playlist (playout management)
- [ ] pba.recorder (recording management)

### Optional Services (environment-specific):
- [ ] pba.watchdog (health monitoring)
- [ ] pba.caster.grid (multiviewer)

## Diagnostics

If services are down, check:

### 1. Log Files

```bash
# Recent errors in logs
tail -20 c:\pba\log\pba.webserver.json
tail -20 c:\pba\log\pba.taskmanager.json
tail -20 c:\pba\log\pba.launcher.json
```

Look for:
- Startup errors
- Database connection failures
- Port binding conflicts
- Unhandled exceptions

### 2. SQL Server Connection

```bash
# Verify SQL Server instance is running
sqlcmd -S localhost\PBA -Q "SELECT @@VERSION" 2>&1
```

Expected: SQL Server version information
If failed: SQL Server not running or instance name wrong

### 3. Port Conflicts

```bash
# Check if ports are in use
netstat -ano | findstr ":1971"  # webserver
netstat -ano | findstr ":1970"  # taskmanager
netstat -ano | findstr ":2971"  # launcher
netstat -ano | findstr ":3000"  # caster.grid
```

If port is in use by different process: Kill process or change port in appsettings.json

### 4. Configuration Issues

Check appsettings.json in each service directory:
- [ ] Database connection string correct?
- [ ] Port configurations correct?
- [ ] JWT token keys configured?
- [ ] NLog log file path writable?

## Recommendations

Based on health check results:

**If all services healthy**:
- ✅ System operational
- ✅ Safe to proceed with development/testing
- ✅ Broadcast automation running normally

**If some services down**:
- ⚠️ Identify which services are critical for your task
- ⚠️ Start missing services manually or via launcher
- ⚠️ Check logs for startup errors
- ⚠️ Verify database connectivity

**If all services down**:
- ❌ Check if SQL Server (localhost\PBA) is running
- ❌ Verify no port conflicts (run `netstat -ano`)
- ❌ Check Windows Event Log for system errors
- ❌ Try starting services manually from Visual Studio or command line

## Starting Services Manually

If services need to be started:

```bash
# Start launcher (which can start other services)
cd c:\pba\pba-client\WEB.2\pba.launcher
dotnet run

# Or start individual service
cd c:\pba\pba-client\WEB.2\pba.webserver
dotnet run

# Or use run scripts (if exist)
run.webserver.bat
run.launcher.bat
```

## Remote Health Checks

For deployed environments:

```bash
# Development (devel branch)
curl http://10.29.177.165:1971/health  # webserver
curl http://10.29.177.165:2971/health  # launcher

# Staging (test branch)
curl http://10.29.177.164:1971/health  # webserver
curl http://10.29.177.164:2971/health  # launcher
```

## Notes

- Health endpoints may not be implemented on all services
- Some services (playlist, recorder, watchdog) may use dynamic ports
- Log files in `c:\pba\log\` are best source of diagnostic info
- Broadcast systems require 24/7 uptime - investigate immediately if services down
