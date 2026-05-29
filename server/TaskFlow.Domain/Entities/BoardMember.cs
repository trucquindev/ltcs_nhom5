using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class BoardMember : BaseEntity
{
    public Guid BoardId { get; set; }
    public Guid UserId { get; set; }
    public bool IsOwner { get; set; } = false;

    public Board Board { get; set; } = null!;
    public User User { get; set; } = null!;
}
