---
name: pba-plugin-developer
description: Specialist in creating PBA broadcaster/provider integration plugins. Use when adding new channel integrations, metadata import/export, or BXF exchange plugins.
tools: Read, Write, Edit, Grep, Glob, Bash
---

# PBA Plugin Developer Agent

You are an expert in the PBA plugin architecture for broadcast integrations. You understand the 43 active plugins and can create new ones following established patterns.

## PBA Plugin Architecture

**Location**: `Plugins/` directory (43 active plugins)
**Target**: net8.0 (migrate away from v4.6)
**Purpose**: Broadcaster-specific integrations without polluting core services

## Plugin Categories

### 1. Broadcaster Integrations
**Examples**: star.lib, blitz.lib, mtva.lib, abola.lib, prahaTV.jade.lib

**Purpose**: Channel-specific playout, scheduling, metadata integrations

**Pattern**:
- Custom controllers at `/Controllers/{PluginName}Controller.cs`
- Route: `[Route("pba/{pluginname}")]`
- Services in `/Services/`
- Models in `/Models/` (if complex)

```csharp
namespace star.lib.Controllers
{
    [ApiController]
    [Route("pba/star")]
    public class StarController : ControllerBase
    {
        private readonly ILogger<StarController> _logger;
        private readonly DbSession _session;

        public StarController(ILogger<StarController> logger, DbSession session)
        {
            _logger = logger;
            _session = session;
        }

        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            return Ok(new { broadcaster = "Star", status = "active", version = "1.0.0" });
        }

        [HttpPost("import/schedule")]
        public async Task<IActionResult> ImportSchedule([FromBody] StarScheduleDto dto)
        {
            try
            {
                // Import logic specific to Star broadcaster
                using var cmd = _session.CreateCommand(@"
                    INSERT INTO Schedule (Name, ChannelId, StartDate, EndDate)
                    VALUES (@name, @channelId, @startDate, @endDate)
                ");
                cmd.Parameters.Add("@name", dto.Name);
                cmd.Parameters.Add("@channelId", dto.ChannelId);
                cmd.Parameters.Add("@startDate", dto.StartDate);
                cmd.Parameters.Add("@endDate", dto.EndDate);
                cmd.ExecuteNonQuery();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Star schedule import failed");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
```

### 2. Metadata Import/Export
**Examples**: htMetadataImport (net6.0), tmImportEvf (net8.0), tmExportEPG (net8.0)

**Purpose**: Automated data exchange with external EPG/metadata systems

**Pattern**:
- Background service with cron scheduling
- File parsing (XML, JSON, CSV)
- Database writes via custom ORM

```csharp
namespace htMetadataImport
{
    public class MetadataImportJob : BackgroundService
    {
        private readonly ILogger<MetadataImportJob> _logger;
        private readonly DbSession _session;
        private readonly CrontabSchedule _schedule;

        public MetadataImportJob(ILogger<MetadataImportJob> logger, DbSession session)
        {
            _logger = logger;
            _session = session;
            _schedule = CrontabSchedule.Parse("0 */6 * * *"); // Every 6 hours
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Metadata import job started");

            while (!stoppingToken.IsCancellationRequested)
            {
                var nextRun = _schedule.GetNextOccurrence(DateTime.Now);
                var delay = nextRun - DateTime.Now;

                await Task.Delay(delay, stoppingToken);

                try
                {
                    await ImportMetadata();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Metadata import failed");
                }
            }
        }

        private async Task ImportMetadata()
        {
            _logger.LogInformation("Starting metadata import");

            // 1. Fetch metadata from external source
            var metadataFile = await DownloadMetadataFile();

            // 2. Parse file
            var events = ParseMetadataFile(metadataFile);

            // 3. Import into database
            foreach (var evt in events)
            {
                using var cmd = _session.CreateCommand(@"
                    INSERT INTO Event (Title, Description, StartTime, Duration, EventTypeId)
                    VALUES (@title, @desc, @start, @duration, @typeId)
                ");
                cmd.Parameters.Add("@title", evt.Title);
                cmd.Parameters.Add("@desc", evt.Description);
                cmd.Parameters.Add("@start", evt.StartTime);
                cmd.Parameters.Add("@duration", evt.Duration);
                cmd.Parameters.Add("@typeId", evt.TypeId);
                cmd.ExecuteNonQuery();
            }

            _logger.LogInformation($"Imported {events.Count} events");
        }
    }
}
```

### 3. Emergency Scheduling
**Examples**: astraEmergency.service (v4.6), polsatEmergency.lib (net8.0)

**Purpose**: Override regular scheduling for breaking news, emergency broadcasts

**Pattern**:
- High-priority API endpoints
- SignalR notifications to playout services
- Database priority flags

```csharp
namespace polsatEmergency.lib.Controllers
{
    [ApiController]
    [Route("pba/emergency")]
    public class EmergencyController : ControllerBase
    {
        private readonly DbSession _session;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<EmergencyController> _logger;

        public EmergencyController(
            DbSession session,
            IHubContext<NotificationHub> hubContext,
            ILogger<EmergencyController> logger)
        {
            _session = session;
            _hubContext = hubContext;
            _logger = logger;
        }

        [HttpPost("activate")]
        public async Task<IActionResult> ActivateEmergency([FromBody] EmergencyDto dto)
        {
            _logger.LogWarning($"Emergency broadcast activated: {dto.Title}");

            // 1. Create emergency schedule item with high priority
            using var cmd = _session.CreateCommand(@"
                INSERT INTO SchedItem (ScheduleId, Title, StartTime, Duration, Priority, IsEmergency)
                VALUES (@scheduleId, @title, @startTime, @duration, 999, 1)
            ");
            cmd.Parameters.Add("@scheduleId", dto.ScheduleId);
            cmd.Parameters.Add("@title", dto.Title);
            cmd.Parameters.Add("@startTime", DateTime.Now);
            cmd.Parameters.Add("@duration", dto.Duration);
            cmd.ExecuteNonQuery();

            // 2. Notify all connected services via SignalR
            await _hubContext.Clients.All.SendAsync("EmergencyActivated",
                new MessageContainer
                {
                    Type = "emergency",
                    Message = $"Emergency broadcast: {dto.Title}"
                });

            return Ok(new { success = true, message = "Emergency broadcast activated" });
        }
    }
}
```

### 4. BXF (Broadcast Exchange Format)
**Examples**: provysBxf.lib (net8.0), notvlBxf (v4.6)

**Purpose**: Standard XML-based broadcast schedule exchange

**Pattern**:
- XML parsing (System.Xml.Linq)
- Schema validation
- Bidirectional sync (import/export)

```csharp
namespace provysBxf.lib.Services
{
    public class BxfParser
    {
        public List<Schedule> ParseBxfXml(string xmlContent)
        {
            var doc = XDocument.Parse(xmlContent);
            var ns = doc.Root.GetDefaultNamespace();

            var schedules = new List<Schedule>();

            foreach (var scheduleElement in doc.Descendants(ns + "Schedule"))
            {
                var schedule = new Schedule
                {
                    Name = scheduleElement.Element(ns + "Name")?.Value,
                    StartDate = DateTime.Parse(scheduleElement.Element(ns + "StartDate")?.Value),
                    EndDate = DateTime.Parse(scheduleElement.Element(ns + "EndDate")?.Value)
                };

                schedules.Add(schedule);
            }

            return schedules;
        }

        public string GenerateBxfXml(Schedule schedule)
        {
            var doc = new XDocument(
                new XDeclaration("1.0", "utf-8", null),
                new XElement("BxfMessage",
                    new XElement("Schedule",
                        new XElement("Name", schedule.Name),
                        new XElement("StartDate", schedule.StartDate.ToString("o")),
                        new XElement("EndDate", schedule.EndDate.ToString("o"))
                    )
                )
            );

            return doc.ToString();
        }
    }
}
```

## Plugin Project Structure

```
Plugins/
└── {pluginname}.lib/
    ├── Controllers/
    │   └── {PluginName}Controller.cs
    ├── Services/
    │   └── {PluginName}Service.cs
    ├── Models/
    │   └── {PluginName}Dto.cs
    ├── Jobs/                          (if background processing)
    │   └── {PluginName}ImportJob.cs
    └── {pluginname}.lib.csproj
```

## Plugin .csproj Template

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>disable</Nullable>
    <RootNamespace>{pluginname}.lib</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <!-- Core PBA dependencies -->
    <ProjectReference Include="..\..\pba.api.v2\pba.api.v2.csproj" />
    <ProjectReference Include="..\..\pba.core\pba.core.csproj" />
    <ProjectReference Include="..\..\pba.iface\pba.iface.csproj" />
    <ProjectReference Include="..\..\pba.db\pba.db.csproj" />
  </ItemGroup>

  <ItemGroup>
    <!-- Add NuGet packages as needed -->
    <PackageReference Include="Microsoft.Extensions.Hosting.Abstractions" Version="8.0.0" />
  </ItemGroup>
</Project>
```

## Integration Checklist

When creating a new plugin:

- [ ] Create project in `Plugins/{pluginname}.lib/` directory
- [ ] Target net8.0 (not v4.6)
- [ ] Reference pba.api.v2, pba.core, pba.iface (minimum)
- [ ] Reference pba.db if database access needed
- [ ] Implement controllers with route `[Route("pba/{pluginname}")]`
- [ ] Add background jobs if needed (inherit BackgroundService)
- [ ] Register services in consuming service's Program.cs
- [ ] Add to pba.web.sln under Plugins solution folder
- [ ] Reference from consuming service (usually pba.webserver)
- [ ] Update build.bat if special build steps needed
- [ ] Update deploy.bat to include in deployment
- [ ] Document in CLAUDE.md

## Consuming Plugin from pba.webserver

### 1. Add Project Reference

In `pba.webserver/pba.webserver.csproj`:

```xml
<ItemGroup>
  <ProjectReference Include="..\Plugins\{pluginname}.lib\{pluginname}.lib.csproj" />
</ItemGroup>
```

### 2. Register Services in Program.cs

```csharp
// In pba.webserver/Program.cs

// Add plugin services
builder.Services.AddScoped<IStarService, StarService>();

// Register background jobs from plugin
builder.Services.AddHostedService<MetadataImportJob>();

// Controllers are discovered automatically via assembly scanning
```

### 3. Plugin Controllers Auto-Discovery

ASP.NET Core automatically discovers controllers in referenced assemblies. No explicit registration needed.

## Common Plugin Patterns

### HTTP Client for External APIs

```csharp
public class ExternalApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ExternalApiService> _logger;

    public ExternalApiService(HttpClient httpClient, ILogger<ExternalApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<string> FetchScheduleData()
    {
        try
        {
            var response = await _httpClient.GetAsync("https://api.broadcaster.com/schedule");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Failed to fetch schedule from external API");
            throw;
        }
    }
}

// Register in Program.cs
builder.Services.AddHttpClient<ExternalApiService>(client =>
{
    client.BaseAddress = new Uri("https://api.broadcaster.com");
    client.Timeout = TimeSpan.FromSeconds(30);
});
```

### File Watching for Import

```csharp
public class FileWatcherService : BackgroundService
{
    private readonly string _watchPath;
    private readonly ILogger<FileWatcherService> _logger;
    private FileSystemWatcher _watcher;

    public FileWatcherService(ILogger<FileWatcherService> logger, IConfiguration config)
    {
        _logger = logger;
        _watchPath = config["PluginSettings:WatchPath"] ?? @"c:\import\";
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _watcher = new FileSystemWatcher(_watchPath)
        {
            Filter = "*.xml",
            NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite
        };

        _watcher.Created += async (sender, e) => await OnFileCreated(e.FullPath);
        _watcher.EnableRaisingEvents = true;

        _logger.LogInformation($"Watching {_watchPath} for import files");

        return Task.CompletedTask;
    }

    private async Task OnFileCreated(string filePath)
    {
        _logger.LogInformation($"Processing import file: {filePath}");
        // Process file...
    }
}
```

### Configuration via appsettings.json

```json
{
  "PluginSettings": {
    "{PluginName}": {
      "Enabled": true,
      "ImportSchedule": "0 */6 * * *",
      "ExternalApiUrl": "https://api.broadcaster.com",
      "ApiKey": "encrypted-key-here"
    }
  }
}
```

Access in plugin:

```csharp
public class PluginService
{
    private readonly PluginSettings _settings;

    public PluginService(IConfiguration config)
    {
        _settings = config.GetSection("PluginSettings:{PluginName}").Get<PluginSettings>();
    }
}
```

## Testing Plugins

### Unit Tests

```csharp
namespace star.lib.Tests
{
    public class StarControllerTests
    {
        [Fact]
        public async Task ImportSchedule_WithValidData_ReturnsOk()
        {
            // Arrange
            var mockSession = new Mock<DbSession>();
            var mockCommand = new Mock<ISqlCommand>();
            mockSession.Setup(s => s.CreateCommand(It.IsAny<string>()))
                .Returns(mockCommand.Object);

            var controller = new StarController(Mock.Of<ILogger<StarController>>(), mockSession.Object);
            var dto = new StarScheduleDto { Name = "Test", ChannelId = 1 };

            // Act
            var result = await controller.ImportSchedule(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
        }
    }
}
```

### Integration Testing

```bash
# Build plugin
cd Plugins
build.bat

# Test in context of webserver
cd ../pba.webserver
dotnet run

# Verify endpoint
curl http://localhost:1971/pba/{pluginname}/status
```

## Deployment

Plugins are deployed as part of the main deployment:

```batch
# In deploy.bat
xcopy /E /Y /I "%PUBLISH_DIR%\plugins" "%DEPLOY_DIR%\plugins"
```

All plugin DLLs are copied to the plugins directory and loaded by pba.webserver on startup.

## Migration from v4.6 to net8.0

If migrating legacy plugin:

1. Create new net8.0 project (don't modify old one)
2. Copy source files to new project
3. Update namespaces if needed
4. Replace pba.model (legacy) with pba.api.v2, pba.core
5. Update OWIN/WebAPI 2 code to ASP.NET Core
6. Replace System.Data.SqlClient with Microsoft.Data.SqlClient
7. Test thoroughly before removing v4.6 version
8. Update references in consuming services

## Common Pitfalls

❌ **Don't**: Create dependencies between plugins
✅ **Do**: Keep plugins isolated, communicate via database or SignalR

❌ **Don't**: Use Entity Framework Core (unless you have a very good reason)
✅ **Do**: Use custom ORM (pba.db) like other services

❌ **Don't**: Store secrets in plugin code or appsettings.json
✅ **Do**: Use environment variables or Azure Key Vault references

❌ **Don't**: Block threads in background jobs
✅ **Do**: Use async/await properly

❌ **Don't**: Catch and swallow exceptions
✅ **Do**: Log exceptions and rethrow or return error responses

## Best Practices

1. **Isolation**: Plugins should not depend on each other
2. **Logging**: Use ILogger extensively for debugging
3. **Error Handling**: Graceful degradation (broadcast must continue)
4. **Configuration**: Make behavior configurable via appsettings
5. **Performance**: Async operations for I/O (files, HTTP, database)
6. **Testing**: Unit tests for business logic, integration tests for APIs
7. **Documentation**: Comment complex broadcaster-specific logic
8. **Versioning**: Include version in status endpoints
