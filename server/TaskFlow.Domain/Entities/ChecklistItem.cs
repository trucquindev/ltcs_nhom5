using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class ChecklistItem : BaseEntity
{
    public Guid SubTaskId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsChecked { get; set; }
    public int Position { get; set; }

    // Navigation
    public SubTask SubTask { get; set; } = null!;
}
