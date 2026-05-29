using TaskFlow.Domain.Common;

namespace TaskFlow.Domain.Entities;

public class BoardChatMessage : BaseEntity
{
    public Guid BoardId { get; set; }
    public Guid UserId { get; set; }
    public string Message { get; set; } = string.Empty;

    // Navigation
    public Board Board { get; set; } = null!;
    public User User { get; set; } = null!;
}
