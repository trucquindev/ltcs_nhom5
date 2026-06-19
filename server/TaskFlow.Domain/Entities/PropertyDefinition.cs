using TaskFlow.Domain.Common;
using TaskFlow.Domain.Enums;

namespace TaskFlow.Domain.Entities;

public class PropertyDefinition : BaseEntity
{
    public Guid BoardId { get; set; }
    public string Name { get; set; } = string.Empty;
    public PropertyType Type { get; set; }
    public string? Options { get; set; } // JSON: select options, defaults, etc.
    public int Position { get; set; }

    // Navigation
    public Board Board { get; set; } = null!;
}
