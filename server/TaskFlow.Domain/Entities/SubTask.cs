using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class SubTask : BaseEntity
{
    public Guid TaskId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public int Position { get; set; }
    public Guid? AssigneeId { get; set; }

    // Navigation
    public TaskItem Task { get; set; } = null!;
    public User? Assignee { get; set; }
    public ICollection<ChecklistItem> ChecklistItems { get; set; } = [];
}
