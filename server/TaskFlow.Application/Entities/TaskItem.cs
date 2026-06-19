using TaskFlow.Domain.Common;
using TaskFlow.Domain.Enums;

namespace TaskFlow.Domain.Entities;

/// <summary>
/// TaskItem represents a card on the Kanban board.
/// Named "TaskItem" to avoid conflict with System.Threading.Tasks.Task.
/// </summary>
public class TaskItem : BaseEntity
{
    public Guid ColumnId { get; set; }
    public Guid? StatusId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Position { get; set; }
    public Priority Priority { get; set; } = Priority.None;
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Cover { get; set; }
    public Guid CreatedById { get; set; }

    // Navigation
    public BoardColumn Column { get; set; } = null!;
    public StatusDefinition? Status { get; set; }
    public User CreatedBy { get; set; } = null!;
    public ICollection<SubTask> SubTasks { get; set; } = [];
    public ICollection<TaskAssignee> Assignees { get; set; } = [];
    public ICollection<TaskProperty> Properties { get; set; } = [];
    public ICollection<TaskComment> Comments { get; set; } = [];
    public ICollection<TaskActivity> Activities { get; set; } = [];
    public ICollection<TaskTimeLog> TimeLogs { get; set; } = [];

    /// <summary>Estimated time in minutes (for time tracking comparison)</summary>
    public int? EstimatedMinutes { get; set; }
}
