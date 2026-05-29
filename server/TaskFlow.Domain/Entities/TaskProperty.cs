using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class TaskProperty : BaseEntity
{
    public Guid TaskId { get; set; }
    public Guid PropertyDefinitionId { get; set; }
    public string? Value { get; set; } // JSON value

    // Navigation
    public TaskItem Task { get; set; } = null!;
    public PropertyDefinition PropertyDefinition { get; set; } = null!;
}
