using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Hubs;
using TaskFlow.Domain.Entities;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BoardsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<BoardHub> _hubContext;

    public BoardsController(AppDbContext db, IHubContext<BoardHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var board = await _db.Boards
            .Include(b => b.Columns.OrderBy(c => c.Position))
                .ThenInclude(c => c.Tasks.OrderBy(t => t.Position))
                    .ThenInclude(t => t.Assignees)
                        .ThenInclude(a => a.User)
            .Include(b => b.Columns)
                .ThenInclude(c => c.Tasks)
                    .ThenInclude(t => t.SubTasks)
            .Include(b => b.StatusDefinitions.OrderBy(s => s.Position))
            .FirstOrDefaultAsync(b => b.Id == id);

        if (board == null) return NotFound();

        return Ok(new
        {
            board.Id,
            board.Name,
            board.Description,
            board.BackgroundColor,
            board.BackgroundImage,
            Columns = board.Columns.Select(c => new
            {
                c.Id,
                c.Title,
                c.Color,
                c.Position,
                c.WipLimit,
                Tasks = c.Tasks.Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.Position,
                    t.Priority,
                    t.StartDate,
                    t.DueDate,
                    t.StatusId,
                    ColumnId = c.Id,
                    SubTaskCount = t.SubTasks.Count,
                    CompletedSubTasks = t.SubTasks.Count(st => st.IsCompleted),
                    Assignees = t.Assignees.Select(a => new
                    {
                        a.User.Id,
                        a.User.DisplayName,
                        a.User.AvatarUrl
                    })
                })
            }),
            Statuses = board.StatusDefinitions.Select(s => new
            {
                s.Id,
                s.Name,
                s.Color,
                s.Position
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBoardRequest request)
    {
        var board = new Board
        {
            WorkspaceId = request.WorkspaceId,
            Name = request.Name,
            Description = request.Description,
            BackgroundColor = request.BackgroundColor ?? "#1a1a2e"
        };

        _db.Boards.Add(board);

        // Create default columns
        var defaultColumns = new[] { "To Do", "In Progress", "Done" };
        for (int i = 0; i < defaultColumns.Length; i++)
        {
            _db.BoardColumns.Add(new BoardColumn
            {
                BoardId = board.Id,
                Title = defaultColumns[i],
                Position = i,
                Color = i switch { 0 => "#6366f1", 1 => "#f59e0b", 2 => "#10b981", _ => "#6b7280" }
            });
        }

        // Create default statuses
        var defaultStatuses = new[] { ("Not Started", "#6b7280"), ("In Progress", "#f59e0b"), ("Completed", "#10b981") };
        for (int i = 0; i < defaultStatuses.Length; i++)
        {
            _db.StatusDefinitions.Add(new StatusDefinition
            {
                BoardId = board.Id,
                Name = defaultStatuses[i].Item1,
                Color = defaultStatuses[i].Item2,
                Position = i
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { board.Id, board.Name });
    }

    [HttpPost("{boardId}/columns")]
    public async Task<IActionResult> AddColumn(Guid boardId, [FromBody] AddColumnRequest request)
    {
        var maxPosition = await _db.BoardColumns
            .Where(c => c.BoardId == boardId)
            .MaxAsync(c => (int?)c.Position) ?? -1;

        var column = new BoardColumn
        {
            BoardId = boardId,
            Title = request.Title,
            Color = request.Color ?? "#6b7280",
            Position = maxPosition + 1,
            WipLimit = request.WipLimit
        };

        _db.BoardColumns.Add(column);
        await _db.SaveChangesAsync();

        await _hubContext.Clients.Group($"board-{boardId}").SendAsync("ColumnAdded", new
        {
            column.Id,
            column.Title,
            column.Color,
            column.Position
        });

        return Ok(new { column.Id, column.Title, column.Position });
    }

    [HttpPut("{boardId}/columns/reorder")]
    public async Task<IActionResult> ReorderColumns(Guid boardId, [FromBody] ReorderRequest request)
    {
        var columns = await _db.BoardColumns.Where(c => c.BoardId == boardId).ToListAsync();

        foreach (var item in request.Items)
        {
            var column = columns.FirstOrDefault(c => c.Id == item.Id);
            if (column != null) column.Position = item.Position;
        }

        await _db.SaveChangesAsync();

        await _hubContext.Clients.Group($"board-{boardId}").SendAsync("ColumnReordered", request.Items);
        return Ok();
    }

    /// <summary>
    /// Delete a board
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var board = await _db.Boards.FindAsync(id);
        if (board == null) return NotFound();

        _db.Boards.Remove(board);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Delete a column
    /// </summary>
    [HttpDelete("{boardId}/columns/{columnId}")]
    public async Task<IActionResult> DeleteColumn(Guid boardId, Guid columnId)
    {
        var column = await _db.BoardColumns
            .FirstOrDefaultAsync(c => c.Id == columnId && c.BoardId == boardId);
        if (column == null) return NotFound();

        _db.BoardColumns.Remove(column);
        await _db.SaveChangesAsync();

        await _hubContext.Clients.Group($"board-{boardId}").SendAsync("ColumnDeleted", new { columnId });
        return NoContent();
    }
}

public record CreateBoardRequest
{
    public Guid WorkspaceId { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public string? BackgroundColor { get; init; }
}

public record AddColumnRequest
{
    public required string Title { get; init; }
    public string? Color { get; init; }
    public int? WipLimit { get; init; }
}

public record ReorderRequest
{
    public required List<ReorderItem> Items { get; init; }
}

public record ReorderItem
{
    public Guid Id { get; init; }
    public int Position { get; init; }
}
