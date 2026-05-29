namespace TaskFlow.Domain.Entities;

public class TaskAssignee
{
    public Guid TaskId { get; set; }
    public Guid UserId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public TaskItem Task { get; set; } = null!;
    public User User { get; set; } = null!;
}
