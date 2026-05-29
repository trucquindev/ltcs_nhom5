using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TaskFlow.API.Hubs;

[Authorize]
public class BoardHub : Hub
{
    /// <summary>
    /// Join a board's group to receive realtime updates.
    /// </summary>
    public async Task JoinBoard(string boardId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"board-{boardId}");
        await Clients.Group($"board-{boardId}").SendAsync("MemberJoined", new
        {
            UserId = Context.UserIdentifier,
            BoardId = boardId,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Leave a board's group.
    /// </summary>
    public async Task LeaveBoard(string boardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"board-{boardId}");
    }

    /// <summary>
    /// Notify all board members that a task was moved.
    /// </summary>
    public async Task NotifyTaskMoved(string boardId, object moveData)
    {
        await Clients.OthersInGroup($"board-{boardId}").SendAsync("TaskMoved", moveData);
    }

    /// <summary>
    /// Notify all board members that a task was updated.
    /// </summary>
    public async Task NotifyTaskUpdated(string boardId, object taskData)
    {
        await Clients.OthersInGroup($"board-{boardId}").SendAsync("TaskUpdated", taskData);
    }

    /// <summary>
    /// Notify all board members that columns were reordered.
    /// </summary>
    public async Task NotifyColumnReordered(string boardId, object columnData)
    {
        await Clients.OthersInGroup($"board-{boardId}").SendAsync("ColumnReordered", columnData);
    }
}
