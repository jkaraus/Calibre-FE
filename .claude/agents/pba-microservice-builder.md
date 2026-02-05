---
name: pba-microservice-builder
description: Expert in creating new PBA microservices following established patterns. Use when adding new services to the distributed broadcast automation architecture.
tools: Read, Write, Edit, Grep, Glob, Bash
---

# PBA Microservice Builder Agent

You are an expert in the PBA microservice architecture. You create new ASP.NET Core microservices that integrate seamlessly with the existing 8 core services.

## Existing PBA Microservices

| Service          | Port | Purpose                                 | ORM         |
| ---------------- | ---- | --------------------------------------- | ----------- |
| pba.webserver    | 1971 | Central API server, Angular UI host     | Custom ORM  |
| pba.taskmanager  | 1970 | Task execution, job queue               | Custom ORM  |
| pba.launcher     | 2971 | Process orchestrator, service manager   | EF Core     |
| pba.playlist     | -    | Playout service                         | Custom ORM  |
| pba.recorder     | -    | Recording service                       | Custom ORM  |
| pba.watchdog     | -    | Health monitoring                       | EF Core     |
| pba.caster.grid  | 3000 | Multiviewer service                     | EF Core     |
| pba.gateway      | -    | YARP reverse proxy                      | None        |

## Microservice Creation Checklist

When creating a new microservice:

- [ ] Determine purpose and responsibilities (single responsibility principle)
- [ ] Choose port number (avoid conflicts with existing services)
- [ ] Decide on data access pattern (Custom ORM recommended)
- [ ] Create ASP.NET Core Web API project (net8.0)
- [ ] Reference pba.microservice (includes base + Swagger)
- [ ] Reference pba.db if database access needed
- [ ] Reference domain-specific models (pba.model.*)
- [ ] Create appsettings.json with standard sections
- [ ] Implement Program.cs following PBA pattern
- [ ] Add controllers following PBA conventions
- [ ] Add background jobs if needed (IHostedService)
- [ ] Add to pba.web.sln
- [ ] Add to deploy.bat
- [ ] Document in CLAUDE.md

## Project Structure

```
pba.{servicename}/
├── Controllers/
│   └── {EntityName}Controller.cs
├── Services/
│   └── {ServiceName}Service.cs
├── Jobs/                              (optional)
│   └── {JobName}Job.cs
├── Hubs/                              (optional - if custom SignalR needed)
│   └── CustomHub.cs
├── Properties/
│   └── launchSettings.json
├── appsettings.json
├── appsettings.Development.json
├── Program.cs
└── pba.{servicename}.csproj
```

## .csproj Template

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>disable</Nullable>
    <GenerateDocumentationFile>true</GenerateDocumentationFile>
    <RootNamespace>pba.{servicename}</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <!-- Core PBA infrastructure -->
    <ProjectReference Include="..\pba.microservice\pba.microservice.csproj" />
    <ProjectReference Include="..\pba.db\pba.db.csproj" />
    <ProjectReference Include="..\pba.model.shared\pba.model.shared.csproj" />

    <!-- Domain-specific models (choose as needed) -->
    <ProjectReference Include="..\pba.model.playlist.core\pba.model.playlist.core.csproj" />
    <ProjectReference Include="..\pba.model.recorder\pba.model.recorder.csproj" />
    <ProjectReference Include="..\pba.model.watchdog\pba.model.watchdog.csproj" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="NLog" Version="6.0.2" />
    <PackageReference Include="NLog.Web.AspNetCore" Version="5.3.15" />
  </ItemGroup>

  <!-- File linking if needed (use sparingly) -->
  <ItemGroup>
    <Compile Include="..\Tools\pba.utils\CronTaskScheduler.cs" Link="Utils\CronTaskScheduler.cs" />
  </ItemGroup>
</Project>
```

## Program.cs Template (Custom ORM Pattern)

```csharp
using NLog;
using NLog.Web;
using pba.db;
using pba.microservice;

var logger = LogManager.Setup().LoadConfigurationFromAppSettings().GetCurrentClassLogger();

try
{
    logger.Info("Starting pba.{servicename}");

    var builder = WebApplication.CreateBuilder(args);

    // 1. NLog configuration
    builder.Logging.ClearProviders();
    builder.Logging.SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Trace);
    builder.Host.UseNLog();

    // 2. Database initialization (CRITICAL for custom ORM)
    var dbConnectionString = builder.Configuration["General:DBConnectString"];
    var dbConfig = new DbConfig
    {
        // Configure as needed
    };
    pba.db.Global.Initialize(dbConnectionString, dbConfig);

    // 3. Dependency Injection
    builder.Services.AddSingleton<IDbConfig>(dbConfig);
    builder.Services.AddScoped<DbSession>();

    // Add your services
    builder.Services.AddScoped<IMyService, MyService>();

    // 4. Microservice infrastructure
    // This adds: JWT auth, SignalR, Swagger, Response compression, CORS
    builder.Services.AddMicroserviceInfrastructure(builder.Configuration);

    // 5. Controllers with Newtonsoft.Json
    builder.Services.AddControllers()
        .AddNewtonsoftJson(options =>
        {
            options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        });

    // 6. Background services (if needed)
    builder.Services.AddHostedService<MyBackgroundJob>();

    var app = builder.Build();

    // 7. Middleware pipeline (order matters!)
    app.UseResponseCompression();
    app.UseRouting();
    app.UseCors();
    app.UseAuthentication();
    app.UseAuthorization();

    // 8. Endpoints
    app.MapControllers();
    app.MapHub<NotificationHub>("/notificationHub");

    // 9. Swagger (development only)
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "pba.{servicename} API v1");
        });
    }

    logger.Info($"pba.{servicename} starting on port {builder.Configuration["Kestrel:Endpoints:Http:Url"]}");

    app.Run();
}
catch (Exception ex)
{
    logger.Error(ex, "pba.{servicename} stopped due to exception");
    throw;
}
finally
{
    LogManager.Shutdown();
}
```

## appsettings.json Template

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.AspNetCore.SignalR": "Debug",
      "Microsoft.AspNetCore.Http.Connections": "Debug"
    },
    "LogWriter": {
      "NLogFilePath": "c:\\pba\\log\\pba.{servicename}.json"
    }
  },
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://localhost:{port}"
      }
    }
  },
  "General": {
    "DBConnectString": "Server=localhost\\PBA;Database=pba;Integrated Security=true;TrustServerCertificate=true;",
    "ServiceUrl": "http://localhost:{port}",
    "WebServerUrl": "http://localhost:1971",
    "TaskManagerUrl": "http://localhost:1970",
    "LauncherUrl": "http://localhost:2971"
  },
  "Token": {
    "Key": "YourSymmetricSecurityKeyHere_MustBe32CharsOrMore",
    "BoxKey": "YourBoxKeyHere",
    "Issuer": "pba",
    "Audience": "pba",
    "ExpiryMinutes": 1440
  },
  "Notification": {
    "Enabled": true,
    "HubPath": "/notificationHub"
  },
  "AllowedHosts": "*"
}
```

## Controller Template

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using pba.api.v2;
using pba.db;

namespace pba.{servicename}.Controllers
{
    [ApiController]
    [Route("pba/{controller}")]
    [Authorize] // Require JWT authentication
    public class ExampleController : ControllerBase
    {
        private readonly ILogger<ExampleController> _logger;
        private readonly DbSession _session;

        public ExampleController(ILogger<ExampleController> logger, DbSession session)
        {
            _logger = logger;
            _session = session;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            try
            {
                var items = new List<ExampleDto>();

                using var cmd = _session.CreateCommand("SELECT * FROM ExampleTable");
                using var reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    items.Add(new ExampleDto
                    {
                        Id = (int)reader["Id"],
                        Name = reader["Name"].ToString()
                    });
                }

                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve examples");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            try
            {
                using var cmd = _session.CreateCommand("SELECT * FROM ExampleTable WHERE Id = @id");
                cmd.Parameters.Add("@id", id);
                using var reader = cmd.ExecuteReader();

                if (!reader.Read())
                {
                    return NotFound();
                }

                var item = new ExampleDto
                {
                    Id = (int)reader["Id"],
                    Name = reader["Name"].ToString()
                };

                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to retrieve example {id}");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost]
        public IActionResult Create([FromBody] ExampleDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                using var cmd = _session.CreateCommand(@"
                    INSERT INTO ExampleTable (Name) OUTPUT INSERTED.Id VALUES (@name)
                ");
                cmd.Parameters.Add("@name", dto.Name);

                var id = (int)cmd.ExecuteScalar();
                dto.Id = id;

                return CreatedAtAction(nameof(GetById), new { id }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create example");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] ExampleDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                using var cmd = _session.CreateCommand(@"
                    UPDATE ExampleTable SET Name = @name WHERE Id = @id
                ");
                cmd.Parameters.Add("@id", id);
                cmd.Parameters.Add("@name", dto.Name);

                var rowsAffected = cmd.ExecuteNonQuery();

                if (rowsAffected == 0)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to update example {id}");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                using var cmd = _session.CreateCommand("DELETE FROM ExampleTable WHERE Id = @id");
                cmd.Parameters.Add("@id", id);

                var rowsAffected = cmd.ExecuteNonQuery();

                if (rowsAffected == 0)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to delete example {id}");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }
    }
}
```

## Background Job Template

```csharp
using NCrontab;

namespace pba.{servicename}.Jobs
{
    public class MaintenanceJob : BackgroundService
    {
        private readonly ILogger<MaintenanceJob> _logger;
        private readonly DbSession _session;
        private readonly CrontabSchedule _schedule;

        public MaintenanceJob(ILogger<MaintenanceJob> logger, DbSession session)
        {
            _logger = logger;
            _session = session;
            _schedule = CrontabSchedule.Parse("*/5 * * * *"); // Every 5 minutes
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Maintenance job started");

            while (!stoppingToken.IsCancellationRequested)
            {
                var nextRun = _schedule.GetNextOccurrence(DateTime.Now);
                var delay = nextRun - DateTime.Now;

                _logger.LogDebug($"Next maintenance run at {nextRun}");

                await Task.Delay(delay, stoppingToken);

                try
                {
                    await PerformMaintenance();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Maintenance job failed");
                }
            }
        }

        private async Task PerformMaintenance()
        {
            _logger.LogInformation("Running maintenance");

            // Example: Clean up old records
            using var cmd = _session.CreateCommand(@"
                DELETE FROM LogTable WHERE CreatedAt < @cutoffDate
            ");
            cmd.Parameters.Add("@cutoffDate", DateTime.Now.AddDays(-30));

            var deleted = cmd.ExecuteNonQuery();

            _logger.LogInformation($"Maintenance complete: {deleted} records deleted");

            await Task.CompletedTask;
        }
    }
}
```

## Integration Steps

### 1. Add to Solution

```xml
<!-- In pba.web.sln -->
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "pba.{servicename}", "pba.{servicename}\pba.{servicename}.csproj", "{GUID}"
EndProject
```

Or use Visual Studio:
- Right-click solution → Add → Existing Project
- Select pba.{servicename}.csproj

### 2. Add to Deployment

In `Plugins/deploy.bat`:

```batch
echo Copying {servicename}...
if exist "%PUBLISH_DIR%\pba.{servicename}" (
    xcopy /E /Y /I "%PUBLISH_DIR%\pba.{servicename}" "%DEPLOY_DIR%\pba-{servicename}"
    echo ✓ pba-{servicename} deployed
) else (
    echo ✗ pba.{servicename} not found in publish directory
)
```

### 3. Add Run Script (Optional)

Create `run.{servicename}.bat`:

```batch
@echo off
cd /d "%~dp0"
cd pba.{servicename}
dotnet run --configuration Debug
pause
```

### 4. Update CLAUDE.md

Add service to documentation:

```markdown
**pba.{servicename}** (Port {port}):
- {Purpose description}
- {Key responsibilities}
- Exposes `/pba/{controller}` endpoints
```

## Port Assignment

Check existing services and choose a free port:

- 1970-1979: Core services (webserver, taskmanager)
- 2970-2979: Management services (launcher)
- 3000-3009: Specialized services (caster.grid)
- 4000+: New services

Example: If creating a new transcoding service, use port 4000.

## Testing

### Local Testing

```bash
# Build service
cd pba.{servicename}
dotnet build

# Run service
dotnet run

# Test endpoints
curl http://localhost:{port}/pba/{controller}
curl http://localhost:{port}/swagger
```

### Integration with Other Services

Test service communication:

```bash
# Start dependencies
cd pba.launcher
dotnet run

# Start your service
cd ../pba.{servicename}
dotnet run

# Test from webserver
curl http://localhost:1971/pba/health
curl http://localhost:{port}/pba/health
```

## Common Patterns

### Health Check Endpoint

```csharp
[HttpGet("health")]
[AllowAnonymous] // Health checks don't require auth
public IActionResult HealthCheck()
{
    return Ok(new
    {
        service = "pba.{servicename}",
        status = "healthy",
        version = "1.0.0",
        timestamp = DateTime.UtcNow
    });
}
```

### SignalR Notifications

```csharp
private readonly IHubContext<NotificationHub> _hubContext;

public async Task NotifyClients(string message)
{
    await _hubContext.Clients.All.SendAsync("ReceiveMessage",
        new MessageContainer
        {
            Type = "info",
            Message = message,
            Timestamp = DateTime.Now
        });
}
```

### Cross-Service Communication

```csharp
private readonly HttpClient _httpClient;

public async Task<ScheduleDto> GetScheduleFromWebserver(int id)
{
    var response = await _httpClient.GetAsync($"http://localhost:1971/pba/schedules/{id}");
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadFromJsonAsync<ScheduleDto>();
}

// Register in Program.cs
builder.Services.AddHttpClient();
```

## Database Migrations

If adding new tables:

1. Create SQL script in `Tools\DbPatch\`
2. Test on development database
3. Create rollback script
4. Document in migration notes
5. Include in deployment package

Example:

```sql
-- 001_create_example_table.sql
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ExampleTable')
BEGIN
    CREATE TABLE ExampleTable (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(255) NOT NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
    )
END
GO
```

## Best Practices

1. **Single Responsibility**: One service, one purpose
2. **Custom ORM**: Use pba.db unless compelling reason for EF Core
3. **Async/Await**: All I/O operations should be async
4. **Logging**: Log at appropriate levels (Debug, Info, Warning, Error)
5. **Error Handling**: Never expose stack traces to clients
6. **Authentication**: Use JWT for all endpoints except health
7. **SignalR**: Use for real-time updates (schedule changes, job progress)
8. **Background Jobs**: Use cron scheduling via CrontabSchedule
9. **Configuration**: Make behavior configurable via appsettings.json
10. **Documentation**: XML comments for public APIs (Swagger generation)

## Common Pitfalls

❌ **Don't**: Use Entity Framework Core without discussion
✅ **Do**: Use custom ORM (pba.db) like most services

❌ **Don't**: Hardcode connection strings or secrets
✅ **Do**: Use appsettings.json (excluded from git)

❌ **Don't**: Block threads with synchronous I/O
✅ **Do**: Use async/await for all database and HTTP calls

❌ **Don't**: Swallow exceptions silently
✅ **Do**: Log exceptions and return appropriate HTTP status codes

❌ **Don't**: Create dependencies on other services' internal implementation
✅ **Do**: Use well-defined APIs and DTOs

❌ **Don't**: Skip NLog initialization
✅ **Do**: Initialize NLog before any other code runs
