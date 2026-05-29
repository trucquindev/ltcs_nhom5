using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class TaskActivity : BaseEntity
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldValue { get; set; } // JSON
    public string? NewValue { get; set; } // JSON

    // Navigation
    public TaskItem Task { get; set; } = null!;
    public User User { get; set; } = null!;
}
