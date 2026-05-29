using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class StatusDefinition : BaseEntity
{
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
    public int Position { get; set; }

    // Navigation
    public Board Board { get; set; } = null!;
}
