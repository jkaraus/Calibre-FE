---
description: Build the PBA solution using the custom build scripts
---

# PBA Build

## Navigate to Plugins Directory

The PBA build system requires running from the Plugins directory.

## Execute Build

!`cd Plugins && build.bat 2>&1`

---

## Build Report

Analyze the build output and provide:

### Build Summary

- **Status**: ✅ Success / ❌ Failed
- **Total Projects**: 117 (expected)
- **Projects Built**: [X]
- **Build Time**: [Extract from output]
- **Output Directory**: c:\pba\.publish\

### Errors (if any)

List compilation errors with:
- Project name
- File and line number
- Error message
- Suggested fix

### Warnings

List significant warnings (ignore common nullable warnings unless excessive):
- Count of warnings by type
- Any critical warnings requiring attention

### Build Artifacts

Confirm these directories exist in c:\pba\.publish\:
- pba-webserver
- pba-taskmanager
- pba-launcher
- pba-playlist
- pba-recorder
- pba-watchdog
- pba-caster-grid
- pba-web
- plugins (with DLLs from 43 active plugins)

## Build System Details

The PBA build system uses:
- **Script**: `Plugins/build.bat`
- **Orchestration**: `c:\pba\pba-client\Tools\pba.scripts\make.csx` (dotnet-script)
- **Target**: All 117 projects in pba.web.sln
- **Configuration**: Release (for deployment)
- **Framework**: net8.0 (modern), v4.6 (legacy)
- **Platform**: x64

## Next Steps

If build succeeds:
- ✅ Run tests: `dotnet test pba.web.sln` or use `/verify-all`
- ✅ Deploy: Use `/deploy` command
- ✅ Start services locally for testing

If build fails:
- ❌ Fix errors listed above
- ❌ Verify .NET SDK 8.0 installed: `dotnet --version`
- ❌ Check for NuGet package restore issues
- ❌ Review recent changes that may have broken compatibility
- ❌ Check if Visual Studio solution file is corrupted

## Common Build Issues

**Issue**: "Project not found" errors
- **Cause**: Missing project references in solution
- **Fix**: Check pba.web.sln for correct project paths

**Issue**: NuGet package restore failures
- **Cause**: Network issues or package source problems
- **Fix**: `dotnet restore pba.web.sln --force`

**Issue**: Framework targeting errors
- **Cause**: Missing .NET SDK version
- **Fix**: Install .NET 8.0 SDK: `winget install Microsoft.DotNet.SDK.8`

**Issue**: Compilation errors in /Generated/ folders
- **Cause**: Generated code out of sync with schema
- **Fix**: Regenerate entities (requires database access and code generator tool)

**Issue**: "AllowUnsafeBlocks" errors in pba.webserver
- **Cause**: Missing PropertyGroup in .csproj
- **Fix**: Verify `<AllowUnsafeBlocks>true</AllowUnsafeBlocks>` in pba.webserver.csproj
