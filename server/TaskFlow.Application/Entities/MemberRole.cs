namespace TaskFlow.Domain.Entities;

public class MemberRole
{
    public Guid MemberId { get; set; }
    public Guid RoleId { get; set; }

    // Navigation
    public WorkspaceMember Member { get; set; } = null!;
    public Role Role { get; set; } = null!;
}
