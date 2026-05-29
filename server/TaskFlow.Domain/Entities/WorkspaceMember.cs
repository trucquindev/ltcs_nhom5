using TaskFlow.Domain.Common;
using TaskFlow.Domain.Enums;

namespace TaskFlow.Domain.Entities;

public class WorkspaceMember : BaseEntity
{
    public Guid WorkspaceId { get; set; }
    public Guid UserId { get; set; }
    public AccessLevel AccessLevel { get; set; } = AccessLevel.CanView;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Workspace Workspace { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<MemberRole> MemberRoles { get; set; } = [];
}
