# Claude Code Configuration for PBA

**Repository**: Stream Circle PBA - Broadcast Automation System
**Technology Stack**: .NET 8.0 C# Microservices
**Last Updated**: 2026-01-24

## Overview

This `.claude` folder contains Claude Code configuration tailored specifically for the PBA broadcast automation system. All configuration has been adapted from generic JavaScript/TypeScript patterns to .NET 8.0 C# microservices architecture.

## Configuration Files

### settings.json

Permissions and environment configuration adapted for .NET development:

**Key Changes from Default**:
- ✅ Replaced npm/node/yarn commands with dotnet/msbuild
- ✅ Added PBA-specific build scripts (build.bat, deploy.bat)
- ✅ Added Windows commands (dir, findstr, xcopy, tasklist, etc.)
- ✅ Added SQL Server tools (sqlcmd)
- ✅ **Critical**: Blocked appsettings*.json files (contain JWT secrets, DB connection strings)
- ✅ Blocked force-push to devel branch (PBA active development branch)
- ✅ Removed PostToolUse prettier hook (not applicable to C#)
- ✅ Added .NET environment variables (DOTNET_CLI_TELEMETRY_OPTOUT)

## Agents

Specialized agents for PBA development workflows:

### PBA-Specific Agents (New)

#### pba-plugin-developer
**Purpose**: Create and maintain broadcaster integration plugins
**When to Use**: Adding new channel integrations, metadata import/export, BXF exchange
**Key Features**:
- 43 active plugin patterns
- Background job scheduling
- XML parsing for BXF
- Database integration via custom ORM
- Examples: star.lib, blitz.lib, mtva.lib ecosystem

#### pba-microservice-builder
**Purpose**: Create new ASP.NET Core microservices
**When to Use**: Adding new services to distributed architecture
**Key Features**:
- Complete service templates (Program.cs, controllers, jobs)
- Custom ORM vs EF Core guidance
- Microservice base infrastructure
- SignalR hub configuration
- Deployment integration

### Updated Core Agents

#### code-architect
**Enhanced with**:
- PBA architecture patterns (custom ORM, microservice base)
- 117-project solution considerations
- Database access patterns (pba.db vs EF Core)
- Background job scheduling (NCrontab)
- SignalR real-time communication
- Plugin architecture constraints
- Legacy migration guidelines (v4.6 to net8.0)

#### test-writer
**Enhanced with**:
- C#/xUnit test patterns (replaces TypeScript/Jest)
- Mock patterns for pba.db custom ORM
- Controller testing (ASP.NET Core)
- Background job testing
- SignalR hub testing
- Integration testing (WebApplicationFactory)
- Broadcast-specific scenarios (timecode, schedules, media files)

#### boris (Master Orchestrator)
**Enhanced with**:
- PBA workflow protocols (117 projects, broadcast criticality)
- CLAUDE.md compliance enforcement
- Blast radius assessment
- Service impact analysis
- Database migration awareness
- Branch-specific deployment logic (devel/test/master)

### Other Agents (Unchanged)

These agents remain technology-agnostic:
- **code-simplifier**: Code cleanup and simplification
- **doc-generator**: Documentation generation
- **pr-reviewer**: Code review
- **oncall-guide**: Production troubleshooting
- **verify-app**: End-to-end verification

## Commands

PBA-specific workflow commands:

### New Commands

#### /build
Build entire PBA solution using custom build scripts
- Runs `Plugins/build.bat`
- Orchestrates 117 projects via dotnet-script
- Publishes to `c:\pba\.publish\`
- Validates build artifacts

#### /deploy
Deploy to network share based on git branch
- Targets `\\10.29.177.152\D\Deployment\{branch}`
- Auto-upgrades devel/test environments
- Handles 8 core services + 43 plugins
- Branch-specific behavior (devel/test/master)

#### /service-health
Check health status of all PBA microservices
- Tests 4 core service endpoints (ports 1971, 1970, 2971, 3000)
- Lists running processes
- Diagnoses common issues (SQL Server, port conflicts, logs)
- Provides recovery recommendations

#### /analyze-db <table>
Analyze database entity and schema
- Searches generated entity models
- Queries SQL Server schema (if accessible)
- Maps foreign key relationships
- Shows usage patterns across codebase
- Provides extension guidance (partial class pattern)

### Updated Commands

#### /verify-all
**Changed from**: npm test, npm run typecheck, npm run lint, npm run build
**Changed to**: build.bat, dotnet test, dotnet format (optional)
- Builds 117-project solution
- Runs xUnit/NUnit tests (if present)
- Validates PBA-specific patterns (ORM, NLog, SignalR)
- Reports blast radius and architectural impact

#### /commit-push-pr
**Enhanced with**:
- PBA-specific conventional commit examples
  - `feat(webserver):`, `fix(playlist):`, `refactor(db):`
  - `feat(plugin):`, `build(deploy):`, `chore(deps):`
- PR template with PBA sections:
  - Services affected
  - Plugins affected
  - Database changes
  - Blast radius (X out of 117 projects)
  - CLAUDE.md compliance checklist
- Git safety warnings (appsettings.json, devel branch)

### Unchanged Commands

- **/first-principles**: First-principles analysis (technology-agnostic)
- **/quick-commit**: Quick commit (basic git)
- **/review-changes**: Review changes (basic git)
- **/test-and-fix**: Test and fix cycle (generic)
- **/update-claude-md**: Update CLAUDE.md with learnings
- **/boris**: Invoke boris orchestrator

## Skill

### boris-workflow
Orchestrator skill for end-to-end workflows (from original configuration)

## Usage Examples

### Creating a New Plugin

```bash
# Invoke the plugin developer agent
/boris Create a new metadata import plugin for BBC broadcast feeds

# Agent will:
# 1. Create plugin structure in Plugins/bbcMetadataImport.lib
# 2. Implement background job with cron scheduling
# 3. Add XML parsing for BBC format
# 4. Integrate with pba.db custom ORM
# 5. Add to pba.web.sln
# 6. Reference from pba.webserver
# 7. Update deployment scripts
```

### Creating a New Microservice

```bash
# Invoke the microservice builder agent
/boris Add a new transcoding service for media processing

# Agent will:
# 1. Create pba.transcoder project (net8.0)
# 2. Reference pba.microservice base
# 3. Implement Program.cs with NLog, JWT, SignalR
# 4. Add controllers following PBA patterns
# 5. Configure custom ORM database access
# 6. Add to solution and deployment scripts
```

### Analyzing Database Entity

```bash
# Analyze a specific entity
/analyze-db Schedule

# Returns:
# - Entity model location and structure
# - Database schema (columns, types, relationships)
# - Usage patterns across codebase
# - Extension recommendations (partial class)
# - Related entities (SchedItem, SchedPattern, etc.)
```

### Checking Service Health

```bash
# Check all services
/service-health

# Returns:
# - Status of webserver (1971), taskmanager (1970), launcher (2971), caster.grid (3000)
# - Running processes
# - Diagnostic recommendations
# - Recovery procedures
```

### Building and Deploying

```bash
# Build solution
/build

# Verify build
/verify-all

# Deploy to test environment
# (must be on 'test' branch)
git checkout test
/deploy
```

### Committing Changes

```bash
# Stage, commit, push, and create PR
/commit-push-pr

# Uses PBA-specific conventional commits:
# - feat(webserver): add schedule export endpoint
# - fix(playlist): resolve timecode calculation
# - chore(deps): update NLog to 6.0.2
```

## PBA Architecture Reference

### Key Patterns

**Custom ORM (Most Services)**:
```csharp
using var session = new DbSession();
using var cmd = session.CreateCommand("SELECT * FROM Table WHERE Id = @id");
cmd.Parameters.Add("@id", id);
using var reader = cmd.ExecuteReader();
```

**Entity Framework Core (3 Services Only)**:
- pba.launcher
- pba.watchdog
- pba.caster.grid

**Microservice Base**:
- JWT Bearer authentication
- SignalR /notificationHub
- NLog logging to `c:\pba\log\`
- Swagger/OpenAPI documentation
- Response compression (Brotli/GZip)

**Background Jobs**:
```csharp
public class MyJob : BackgroundService
{
    private readonly CrontabSchedule _schedule = CrontabSchedule.Parse("*/5 * * * *");

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(_schedule.GetNextOccurrence(DateTime.Now) - DateTime.Now);
            // Do work
        }
    }
}
```

### Solution Structure

- **Total Projects**: 117
- **Root-level**: 31 (core services, infrastructure, models)
- **.framework**: 24 (legacy .NET Framework 4.6, being migrated)
- **Plugins**: 43 (broadcaster integrations, import/export)
- **.obsolete**: 16 (deprecated)
- **.playground**: 3 (experimental)

### Core Services

| Service | Port | Purpose |
|---------|------|---------|
| pba.webserver | 1971 | Central API server, Angular UI |
| pba.taskmanager | 1970 | Task execution, job queue |
| pba.launcher | 2971 | Service orchestrator |
| pba.playlist | - | Playout management |
| pba.recorder | - | Recording management |
| pba.watchdog | - | Health monitoring |
| pba.caster.grid | 3000 | Multiviewer |
| pba.gateway | - | YARP reverse proxy |

## CLAUDE.md Compliance

All agents and commands enforce CLAUDE.md rules:

- ✅ **No code modifications without approval** - RFC/proposal first
- ✅ **No public API changes** - Breaking changes require approval
- ✅ **No cross-project refactors** - Minimize blast radius (117 projects)
- ✅ **Database changes scripted** - Reversible migration scripts
- ✅ **Follow existing patterns** - Custom ORM, microservice base, SignalR
- ✅ **Security** - appsettings.json blocked, secrets protection

## Migration Notes

This configuration was migrated from a generic JavaScript/TypeScript setup to PBA-specific .NET 8.0 C# configuration on 2026-01-24.

**Major Changes**:
1. Replaced all npm/node commands with dotnet/msbuild
2. Updated all code examples from TypeScript to C#
3. Added PBA-specific agents (plugin-developer, microservice-builder)
4. Created PBA-specific commands (build, deploy, service-health, analyze-db)
5. Enhanced all agents with PBA architecture context
6. Updated verification workflows for .NET build system
7. Added security protections (appsettings.json, devel branch)

## Support

For questions about this configuration:
- See CLAUDE.md for PBA architecture details
- See ARCHITECTURE_ANALYSIS.md for comprehensive system analysis
- Use `/boris` command for complex workflow orchestration
