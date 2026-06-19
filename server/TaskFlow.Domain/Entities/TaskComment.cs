using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class TaskComment : BaseEntity
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;

    // Navigation
    public TaskItem Task { get; set; } = null!;
    public User User { get; set; } = null!;
}
