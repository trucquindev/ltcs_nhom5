using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class Role : BaseEntity
{
    public Guid WorkspaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystem { get; set; }

    // Navigation
    public Workspace Workspace { get; set; } = null!;
    public ICollection<RolePermission> RolePermissions { get; set; } = [];
    public ICollection<MemberRole> MemberRoles { get; set; } = [];
}
