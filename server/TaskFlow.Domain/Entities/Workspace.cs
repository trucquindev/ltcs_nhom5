using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class Workspace : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public Guid OwnerId { get; set; }

    // Navigation
    public User Owner { get; set; } = null!;
    public ICollection<WorkspaceMember> Members { get; set; } = [];
    public ICollection<Board> Boards { get; set; } = [];
    public ICollection<Role> Roles { get; set; } = [];
}
