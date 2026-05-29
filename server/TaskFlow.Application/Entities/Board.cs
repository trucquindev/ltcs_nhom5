using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class Board : BaseEntity
{
    public Guid WorkspaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? BackgroundColor { get; set; }
    public string? BackgroundImage { get; set; }
    public int Position { get; set; }

    // Navigation
    public Workspace Workspace { get; set; } = null!;
    public ICollection<BoardColumn> Columns { get; set; } = [];
    public ICollection<StatusDefinition> StatusDefinitions { get; set; } = [];
    public ICollection<PropertyDefinition> PropertyDefinitions { get; set; } = [];
    public ICollection<BoardMember> BoardMembers { get; set; } = [];
    public ICollection<BoardInvitation> Invitations { get; set; } = [];
}
