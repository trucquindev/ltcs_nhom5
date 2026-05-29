using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class BoardInvitation : BaseEntity
{
    public Guid BoardId { get; set; }
    public Guid InviterId { get; set; }
    public Guid InviteeId { get; set; }
    public string Status { get; set; } = "PENDING"; // PENDING | ACCEPTED | REJECTED

    public Board Board { get; set; } = null!;
    public User Inviter { get; set; } = null!;
    public User Invitee { get; set; } = null!;
}
