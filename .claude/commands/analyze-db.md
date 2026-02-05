---
description: Analyze database schema and entity models for a specific table or entity
---

# Database Analysis

**Entity/Table**: $ARGUMENTS

---

## Entity Model Search

Search for entity class definition in generated folders:

!`grep -r "class $ARGUMENTS" pba.db/Generated/ pba.api.v2/Generated/ --include="*.cs" -A 5 2>&1 || echo "Entity not found in generated code"`

## Entity Usage Analysis

Find usages of entity across codebase:

!`grep -r "$ARGUMENTS" --include="*.cs" . -l | head -20 2>&1 || echo "No usages found"`

## Database Schema (if SQL Server accessible)

!`sqlcmd -S localhost\\PBA -d pba -Q "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '$ARGUMENTS' ORDER BY ORDINAL_POSITION" -h-1 2>&1 || echo "Direct DB access not available or table not found"`

## Table Relationships

!`sqlcmd -S localhost\\PBA -d pba -Q "SELECT FK.name AS FK_Name, TP.name AS ParentTable, CP.name AS ParentColumn, TR.name AS ReferencedTable, CR.name AS ReferencedColumn FROM sys.foreign_keys AS FK INNER JOIN sys.tables AS TP ON FK.parent_object_id = TP.object_id INNER JOIN sys.tables AS TR ON FK.referenced_object_id = TR.object_id INNER JOIN sys.foreign_key_columns AS FKC ON FK.object_id = FKC.constraint_object_id INNER JOIN sys.columns AS CP ON FKC.parent_column_id = CP.column_id AND FKC.parent_object_id = CP.object_id INNER JOIN sys.columns AS CR ON FKC.referenced_column_id = CR.column_id AND FKC.referenced_object_id = CR.object_id WHERE TP.name = '$ARGUMENTS' OR TR.name = '$ARGUMENTS'" -h-1 2>&1 || echo "Relationship query not available"`

---

## Analysis Report

### Entity Summary

- **Entity Name**: $ARGUMENTS
- **Location**: [pba.db/Generated or pba.api.v2/Generated]
- **Namespace**: [Extract from grep results]
- **Base Class**: [Typically DataItem or base entity class]

### Schema Details

Provide table structure summary:

| Column Name | Data Type | Nullable | Default | Description/Purpose |
| ----------- | --------- | -------- | ------- | ------------------- |
| [List columns from schema query]

### Key Columns

Identify:
- **Primary Key**: [Column name, typically Id]
- **Foreign Keys**: [List relationships found]
- **Timestamps**: [CreatedAt, UpdatedAt, etc.]
- **Audit**: [CreatedBy, ModifiedBy, etc.]
- **Flags**: [IsActive, IsDeleted, IsEmergency, etc.]

### Relationships

Map foreign key relationships:

**Parent Tables** (this entity references):
- [Table] via [Column] → [Referenced Table].[Referenced Column]

**Child Tables** (entities that reference this):
- [Table].[Column] references this entity

### Usage Patterns

Analyze code usage:

**Controllers**:
- [List controllers that use this entity]
- [Common operations: GET, POST, PUT, DELETE]

**Services**:
- [List services that manipulate this entity]
- [Business logic patterns]

**Background Jobs**:
- [Any cron jobs that process this entity]

**Plugins**:
- [Plugins that import/export this entity]

### Common Queries

Based on usage analysis, list common query patterns:

```sql
-- Example queries found in codebase
SELECT * FROM $ARGUMENTS WHERE ...
```

### Entity Model Structure

Show entity class structure (from grep results):

```csharp
public class $ARGUMENTS : DataItem
{
    public int Id { get; set; }
    // [Additional properties from grep output]
}
```

### Extension Opportunities

Recommendations for extending via partial class:

**Current**: Entity is generated code in `/Generated/` folder
**Extension Pattern**: Create partial class outside `/Generated/`

```csharp
// In pba.db/Extensions/$ARGUMENTS.cs (example)
namespace pba.db
{
    public partial class $ARGUMENTS
    {
        // Add custom properties
        [NotMapped]
        public string CustomProperty => $"{Property1} - {Property2}";

        // Add custom methods
        public void CustomMethod()
        {
            // Business logic
        }

        // Add validation
        public bool IsValid()
        {
            return !string.IsNullOrEmpty(Name) && Id > 0;
        }
    }
}
```

### Related Entities

Based on foreign keys and usage, list related entities:

- **Schedule** → **SchedItem** (one-to-many)
- **SchedItem** → **File** (many-to-one)
- **Event** → **EventType** (many-to-one)

### Database Migration Considerations

If planning schema changes:

- **Impact**: [Number of records in table, if queryable]
- **Relationships**: [Cascading deletes, referential integrity]
- **Migration Script Required**: Yes (follow CLAUDE.md rules)
- **Rollback Script Required**: Yes (must be reversible)

## Common Entities in PBA

**Core Scheduling**:
- Schedule
- SchedItem
- SchedPattern
- SchedItemType

**Media**:
- File
- Folder
- FolderFile
- Media
- MediaFormat

**Events**:
- Event
- EventType
- EventCategory

**Jobs**:
- Job
- JobTemplate
- JobType

**System**:
- Server
- ServerType
- Storage
- User
- UserRole
- Account
- ConfigProfile

**Logging**:
- AsrunLog
- AuditLog

## Notes

- Entity models in `/Generated/` folders should NEVER be modified directly
- Use partial class pattern for extensions
- Database queries require SQL Server instance (localhost\PBA) running
- If SQL Server not accessible, analysis will be limited to code search
- Schema changes must be approved and scripted (CLAUDE.md compliance)
