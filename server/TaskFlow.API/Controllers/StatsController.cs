using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController : ControllerBase
{
    private readonly AppDbContext _db;

    public StatsController(AppDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Get global statistics for the user (across all workspaces)
    /// </summary>
    [HttpGet("global")]
    public async Task<IActionResult> GetGlobalStats()
    {
        var userId = GetUserId();

        // Workspaces the user has access to
        var workspaces = await _db.Workspaces
            .Include(w => w.Members)
            .Include(w => w.Boards)
            .ThenInclude(b => b.Columns)
            .ThenInclude(c => c.Tasks)
            .ThenInclude(t => t.Assignees)
            .Where(w => w.Members.Any(m => m.UserId == userId))
            .ToListAsync();

        var totalWorkspaces = workspaces.Count;
        var boards = workspaces.SelectMany(w => w.Boards).ToList();
        var totalBoards = boards.Count;

        // All tasks across all boards the user can see
        var allTasks = boards.SelectMany(b => b.Columns).SelectMany(c => c.Tasks).ToList();

        // Tasks specifically assigned to the user
        var myTasks = allTasks.Where(t => t.Assignees.Any(a => a.UserId == userId)).ToList();

        var assignedTasksCount = myTasks.Count;
        var overdueTasksCount = myTasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow);

        // My tasks details (sorted by due date, then created)
        var myTasksDetails = myTasks
            .OrderBy(t => t.DueDate ?? DateTime.MaxValue)
            .ThenByDescending(t => t.CreatedAt)
            .Take(20)
            .Select(t => new
            {
                t.Id,
                t.Title,
                Priority = (int)t.Priority,
                t.DueDate,
                BoardId = boards.FirstOrDefault(b => b.Columns.Any(c => c.Id == t.ColumnId))?.Id,
                BoardName = boards.FirstOrDefault(b => b.Columns.Any(c => c.Id == t.ColumnId))?.Name,
                ColumnName = boards.SelectMany(b => b.Columns).FirstOrDefault(c => c.Id == t.ColumnId)?.Title,
                ColumnColor = boards.SelectMany(b => b.Columns).FirstOrDefault(c => c.Id == t.ColumnId)?.Color,
            });

        // Weekly completion chart (tasks in last columns updated in last 7 days)
        var weekAgo = DateTime.UtcNow.AddDays(-7);
        var completedTasks = allTasks.Where(t =>
        {
            var board = boards.FirstOrDefault(b => b.Columns.Any(c => c.Id == t.ColumnId));
            var lastCol = board?.Columns.OrderBy(c => c.Position).LastOrDefault();
            return lastCol != null && t.ColumnId == lastCol.Id && t.UpdatedAt >= weekAgo;
        }).ToList();

        var chartData = Enumerable.Range(0, 7).Select(offset =>
        {
            var date = DateTime.UtcNow.Date.AddDays(-6 + offset);
            return new
            {
                Date = date.ToString("MMM dd"),
                Completed = completedTasks.Count(t => t.UpdatedAt.Date == date)
            };
        }).ToList();

        // Recent boards
        var recentBoards = boards.OrderByDescending(b => b.CreatedAt).Take(6).Select(b => new
        {
            b.Id,
            b.Name,
            WorkspaceName = workspaces.FirstOrDefault(w => w.Id == b.WorkspaceId)?.Name,
            TaskCount = b.Columns.Sum(c => c.Tasks.Count),
            b.BackgroundColor
        });

        return Ok(new
        {
            TotalWorkspaces = totalWorkspaces,
            TotalBoards = totalBoards,
            AssignedTasksCount = assignedTasksCount,
            OverdueTasksCount = overdueTasksCount,
            MyTasks = myTasksDetails,
            WeeklyChart = chartData,
            RecentBoards = recentBoards
        });
    }



    /// <summary>
    /// Get workspace-level statistics
    /// </summary>
    [HttpGet("workspace/{workspaceId}")]
    public async Task<IActionResult> GetWorkspaceStats(Guid workspaceId)
    {
        var userId = GetUserId();

        var workspace = await _db.Workspaces
            .Include(w => w.Members)
            .Include(w => w.Boards)
            .ThenInclude(b => b.Columns)
            .ThenInclude(c => c.Tasks)
            .FirstOrDefaultAsync(w => w.Id == workspaceId && w.Members.Any(m => m.UserId == userId));

        if (workspace == null) return NotFound();

        var allTasks = workspace.Boards
            .SelectMany(b => b.Columns)
            .SelectMany(c => c.Tasks)
            .ToList();

        return Ok(new
        {
            TotalBoards = workspace.Boards.Count,
            TotalMembers = workspace.Members.Count,
            TotalTasks = allTasks.Count,
            CompletedTasks = allTasks.Count(t =>
            {
                var board = workspace.Boards.FirstOrDefault(b => b.Columns.Any(c => c.Id == t.ColumnId));
                var lastCol = board?.Columns.OrderBy(c => c.Position).LastOrDefault();
                return lastCol != null && t.ColumnId == lastCol.Id;
            }),
            OverdueTasks = allTasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow)
        });
    }
}
