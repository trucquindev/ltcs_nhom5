using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class BoardColumn : BaseEntity
{
    public Guid BoardId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Color { get; set; }
    public int Position { get; set; }
    public int? WipLimit { get; set; }

    // Navigation
    public Board Board { get; set; } = null!;
    public ICollection<TaskItem> Tasks { get; set; } = [];
}
