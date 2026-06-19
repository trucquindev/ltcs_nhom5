using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

/// <summary>
/// Time tracking log for a task — records actual working hours.
/// </summary>
public class TaskTimeLog : BaseEntity
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public int DurationMinutes { get; set; }
    public string? Note { get; set; }
    public DateTime LoggedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public TaskItem Task { get; set; } = null!;
    public User User { get; set; } = null!;
}
