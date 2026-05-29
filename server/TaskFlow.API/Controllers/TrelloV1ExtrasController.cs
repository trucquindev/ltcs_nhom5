using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.API.Controllers;

// ─── Card Checklist ──────────────────────────────────────────────────────────

[ApiController]
[Route("v1/cards/{cardId}/checklist")]
[Authorize]
public class TrelloChecklistController : ControllerBase
{
    private readonly AppDbContext _db;
    public TrelloChecklistController(AppDbContext db) => _db = db;
    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// POST /v1/cards/{cardId}/checklist — Add a checklist item directly to a card
    [HttpPost]
    public async Task<IActionResult> Add(Guid cardId, [FromBody] AddChecklistItemRequest req)
    {
        var task = await _db.Tasks.FindAsync(cardId);
        if (task == null) return NotFound();

        // We store checklist items at the card level via SubTask with title = req.Title
        var maxPos = await _db.SubTasks.Where(st => st.TaskId == cardId).MaxAsync(st => (int?)st.Position) ?? -1;
        var subTask = new SubTask
        {
            TaskId = cardId,
            Title = req.Title,
            Position = maxPos + 1,
            AssigneeId = req.AssigneeId.HasValue ? req.AssigneeId : null
        };
        _db.SubTasks.Add(subTask);
        await _db.SaveChangesAsync();

        return StatusCode(201, new
        {
            _id = subTask.Id,
            taskId = cardId,
            title = subTask.Title,
            isCompleted = subTask.IsCompleted,
            position = subTask.Position,
            assigneeId = subTask.AssigneeId
        });
    }

    /// PUT /v1/cards/{cardId}/checklist/{itemId} — Toggle or update checklist item
    [HttpPut("{itemId}")]
    public async Task<IActionResult> Update(Guid cardId, Guid itemId, [FromBody] UpdateChecklistItemRequest req)
    {
        var item = await _db.SubTasks.FirstOrDefaultAsync(st => st.Id == itemId && st.TaskId == cardId);
        if (item == null) return NotFound();

        if (req.IsCompleted.HasValue) item.IsCompleted = req.IsCompleted.Value;
        if (req.Title != null) item.Title = req.Title;
        if (req.AssigneeId.HasValue) item.AssigneeId = req.AssigneeId.Value == Guid.Empty ? null : req.AssigneeId;

        await _db.SaveChangesAsync();
        return Ok(new { _id = item.Id, title = item.Title, isCompleted = item.IsCompleted, assigneeId = item.AssigneeId });
    }

    /// DELETE /v1/cards/{cardId}/checklist/{itemId}
    [HttpDelete("{itemId}")]
    public async Task<IActionResult> Delete(Guid cardId, Guid itemId)
    {
        var item = await _db.SubTasks.FirstOrDefaultAsync(st => st.Id == itemId && st.TaskId == cardId);
        if (item == null) return NotFound();
        _db.SubTasks.Remove(item);
        await _db.SaveChangesAsync();
        return Ok(new { deleteResult = "Deleted successfully" });
    }
}

// ─── Card Priority / Dates / Delete ──────────────────────────────────────────

[ApiController]
[Route("v1/cards")]
[Authorize]
public class TrelloCardExtrasController : ControllerBase
{
    private readonly AppDbContext _db;
    public TrelloCardExtrasController(AppDbContext db) => _db = db;
    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// PUT /v1/cards/{id}/priority
    [HttpPut("{id}/priority")]
    public async Task<IActionResult> UpdatePriority(Guid id, [FromBody] UpdatePriorityRequest req)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        task.Priority = req.Priority;
        await _db.SaveChangesAsync();
        return Ok(new { _id = task.Id, priority = (int)task.Priority });
    }

    /// PUT /v1/cards/{id}/dates
    [HttpPut("{id}/dates")]
    public async Task<IActionResult> UpdateDates(Guid id, [FromBody] UpdateDatesRequest req)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        if (req.StartDate.HasValue) task.StartDate = req.StartDate;
        if (req.DueDate.HasValue) task.DueDate = req.DueDate;
        if (req.ClearStartDate == true) task.StartDate = null;
        if (req.ClearDueDate == true) task.DueDate = null;
        await _db.SaveChangesAsync();
        return Ok(new { _id = task.Id, startDate = task.StartDate, dueDate = task.DueDate });
    }

    /// PUT /v1/cards/{id}/estimation
    [HttpPut("{id}/estimation")]
    public async Task<IActionResult> UpdateEstimation(Guid id, [FromBody] UpdateEstimationRequest req)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();
        task.EstimatedMinutes = req.EstimatedMinutes;
        await _db.SaveChangesAsync();
        return Ok(new { _id = task.Id, estimatedMinutes = task.EstimatedMinutes });
    }

    /// DELETE /v1/cards/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var task = await _db.Tasks.Include(t => t.Column).FirstOrDefaultAsync(t => t.Id == id);
        if (task == null) return NotFound();
        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return Ok(new { deleteResult = "Card deleted successfully" });
    }
}

// ─── Board Analytics ─────────────────────────────────────────────────────────

[ApiController]
[Route("v1/boards/{boardId}/analytics")]
[Authorize]
public class TrelloAnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;
    public TrelloAnalyticsController(AppDbContext db) => _db = db;
    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// GET /v1/boards/{boardId}/analytics
    [HttpGet]
    public async Task<IActionResult> GetAnalytics(Guid boardId)
    {
        var userId = GetUserId();
        var board = await _db.Boards
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.Assignees).ThenInclude(a => a.User)
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.TimeLogs)
            .Include(b => b.BoardMembers).ThenInclude(bm => bm.User)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null) return NotFound();

        var allTasks = board.Columns.SelectMany(c => c.Tasks).ToList();
        var totalTasks = allTasks.Count;
        var lastColumn = board.Columns.OrderBy(c => c.Position).LastOrDefault();

        // Tasks by column
        var tasksByColumn = board.Columns.OrderBy(c => c.Position).Select(c => new
        {
            _id = c.Id,
            name = c.Title,
            color = c.Color,
            count = c.Tasks.Count
        }).ToList();

        // Tasks by priority
        var tasksByPriority = allTasks
            .GroupBy(t => t.Priority)
            .Select(g => new
            {
                priority = (int)g.Key,
                priorityName = g.Key.ToString(),
                count = g.Count()
            })
            .OrderBy(x => x.priority)
            .ToList();

        // Completed vs overdue per member
        var memberStats = board.BoardMembers.Select(bm =>
        {
            var memberTasks = allTasks.Where(t => t.Assignees.Any(a => a.UserId == bm.UserId)).ToList();
            return new
            {
                _id = bm.UserId,
                displayName = bm.User.DisplayName,
                avatar = bm.User.AvatarUrl,
                totalAssigned = memberTasks.Count,
                completed = lastColumn != null ? memberTasks.Count(t => t.ColumnId == lastColumn.Id) : 0,
                overdue = memberTasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow && (lastColumn == null || t.ColumnId != lastColumn.Id)),
                totalTimeMinutes = memberTasks.Sum(t => t.TimeLogs.Where(tl => tl.UserId == bm.UserId).Sum(tl => tl.DurationMinutes))
            };
        }).ToList();

        // Burndown: daily completion counts last 14 days
        var burndown = Enumerable.Range(0, 14).Select(offset =>
        {
            var date = DateTime.UtcNow.Date.AddDays(-13 + offset);
            return new
            {
                date = date.ToString("MMM dd"),
                completed = lastColumn != null
                    ? allTasks.Count(t => t.ColumnId == lastColumn.Id && t.UpdatedAt.Date == date)
                    : 0,
                created = allTasks.Count(t => t.CreatedAt.Date == date)
            };
        }).ToList();

        var completedCount = lastColumn?.Tasks.Count ?? 0;
        var completionRate = totalTasks > 0 ? Math.Round((double)completedCount / totalTasks * 100, 1) : 0;
        var overdueTasks = allTasks.Count(t => t.DueDate.HasValue && t.DueDate.Value < DateTime.UtcNow && (lastColumn == null || t.ColumnId != lastColumn.Id));

        return Ok(new
        {
            totalTasks,
            completedCount,
            completionRate,
            overdueTasks,
            tasksByColumn,
            tasksByPriority,
            memberStats,
            burndown
        });
    }
}

// ─── Time Tracking ───────────────────────────────────────────────────────────

[ApiController]
[Route("v1/cards/{cardId}/timelogs")]
[Authorize]
public class TrelloTimeLogController : ControllerBase
{
    private readonly AppDbContext _db;
    public TrelloTimeLogController(AppDbContext db) => _db = db;
    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// GET /v1/cards/{cardId}/timelogs
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid cardId)
    {
        var logs = await _db.TaskTimeLogs
            .Where(tl => tl.TaskId == cardId)
            .Include(tl => tl.User)
            .OrderByDescending(tl => tl.LoggedAt)
            .Select(tl => new
            {
                _id = tl.Id,
                taskId = tl.TaskId,
                userId = tl.UserId,
                userDisplayName = tl.User.DisplayName,
                userAvatar = tl.User.AvatarUrl,
                durationMinutes = tl.DurationMinutes,
                note = tl.Note,
                loggedAt = tl.LoggedAt
            })
            .ToListAsync();

        return Ok(logs);
    }

    /// POST /v1/cards/{cardId}/timelogs
    [HttpPost]
    public async Task<IActionResult> Add(Guid cardId, [FromBody] AddTimeLogRequest req)
    {
        var userId = GetUserId();
        var log = new TaskTimeLog
        {
            TaskId = cardId,
            UserId = userId,
            DurationMinutes = req.DurationMinutes,
            Note = req.Note,
            LoggedAt = req.LoggedAt ?? DateTime.UtcNow
        };
        _db.TaskTimeLogs.Add(log);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        return StatusCode(201, new
        {
            _id = log.Id,
            taskId = log.TaskId,
            userId = log.UserId,
            userDisplayName = user?.DisplayName,
            userAvatar = user?.AvatarUrl,
            durationMinutes = log.DurationMinutes,
            note = log.Note,
            loggedAt = log.LoggedAt
        });
    }

    /// DELETE /v1/cards/{cardId}/timelogs/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid cardId, Guid id)
    {
        var log = await _db.TaskTimeLogs.FirstOrDefaultAsync(tl => tl.Id == id && tl.TaskId == cardId);
        if (log == null) return NotFound();
        _db.TaskTimeLogs.Remove(log);
        await _db.SaveChangesAsync();
        return Ok(new { deleteResult = "Time log deleted" });
    }
}

// ─── Board Export ─────────────────────────────────────────────────────────────

[ApiController]
[Route("v1/boards/{boardId}/export")]
[Authorize]
public class TrelloExportController : ControllerBase
{
    private readonly AppDbContext _db;
    public TrelloExportController(AppDbContext db) => _db = db;
    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// GET /v1/boards/{boardId}/export/csv — Export board as CSV
    [HttpGet("csv")]
    public async Task<IActionResult> ExportCsv(Guid boardId)
    {
        var board = await _db.Boards
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.Assignees).ThenInclude(a => a.User)
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.Comments)
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.SubTasks)
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.TimeLogs)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null) return NotFound();

        var lines = new List<string> { "Column,Task,Priority,Start Date,Due Date,Assignees,Sub-tasks,Comments,Time Logged (min),Status" };

        foreach (var col in board.Columns.OrderBy(c => c.Position))
        {
            foreach (var task in col.Tasks.OrderBy(t => t.Position))
            {
                var assignees = string.Join("; ", task.Assignees.Select(a => a.User.DisplayName));
                var subTaskInfo = task.SubTasks.Any() ? $"{task.SubTasks.Count(st => st.IsCompleted)}/{task.SubTasks.Count}" : "—";
                var timeLogged = task.TimeLogs.Sum(tl => tl.DurationMinutes);
                var line = $"\"{Esc(col.Title)}\",\"{Esc(task.Title)}\",\"{task.Priority}\",\"{task.StartDate?.ToString("yyyy-MM-dd") ?? ""}\",\"{task.DueDate?.ToString("yyyy-MM-dd") ?? ""}\",\"{Esc(assignees)}\",\"{subTaskInfo}\",\"{task.Comments.Count}\",\"{timeLogged}\",\"{Esc(col.Title)}\"";
                lines.Add(line);
            }
        }

        var csv = string.Join("\n", lines);
        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"{board.Name.Replace(" ", "_")}_export.csv");
    }

    /// GET /v1/boards/{boardId}/export/json — Export board as JSON
    [HttpGet("json")]
    public async Task<IActionResult> ExportJson(Guid boardId)
    {
        var board = await _db.Boards
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.Assignees).ThenInclude(a => a.User)
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.Comments).ThenInclude(c => c.User)
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.SubTasks)
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.TimeLogs).ThenInclude(tl => tl.User)
            .FirstOrDefaultAsync(b => b.Id == boardId);

        if (board == null) return NotFound();

        var export = new
        {
            board = new { _id = board.Id, title = board.Name, description = board.Description },
            exportedAt = DateTime.UtcNow,
            columns = board.Columns.OrderBy(c => c.Position).Select(c => new
            {
                title = c.Title,
                tasks = c.Tasks.OrderBy(t => t.Position).Select(t => new
                {
                    title = t.Title,
                    description = t.Description,
                    priority = t.Priority.ToString(),
                    startDate = t.StartDate,
                    dueDate = t.DueDate,
                    assignees = t.Assignees.Select(a => a.User.DisplayName),
                    subTasks = t.SubTasks.Select(st => new { st.Title, st.IsCompleted }),
                    comments = t.Comments.Select(cm => new { cm.Content, user = cm.User.DisplayName, cm.CreatedAt }),
                    timeLogs = t.TimeLogs.Select(tl => new { user = tl.User.DisplayName, tl.DurationMinutes, tl.Note, tl.LoggedAt })
                })
            })
        };

        return Ok(export);
    }

    private static string Esc(string s) => s?.Replace("\"", "\"\"") ?? "";
}

// ─── Global Dashboard for trello-web ─────────────────────────────────────────

[ApiController]
[Route("v1/dashboard")]
[Authorize]
public class TrelloDashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    public TrelloDashboardController(AppDbContext db) => _db = db;
    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// GET /v1/dashboard — Global dashboard stats
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = GetUserId();

        var boards = await _db.BoardMembers
            .Where(bm => bm.UserId == userId)
            .Include(bm => bm.Board).ThenInclude(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.Assignees)
            .Select(bm => bm.Board)
            .ToListAsync();

        var totalBoards = boards.Count;
        var allTasks = boards.SelectMany(b => b.Columns).SelectMany(c => c.Tasks).ToList();
        var myTasks = allTasks.Where(t => t.Assignees.Any(a => a.UserId == userId)).ToList();

        var overdueCount = myTasks.Count(t =>
        {
            if (!t.DueDate.HasValue) return false;
            var board = boards.FirstOrDefault(b => b.Columns.Any(c => c.Id == t.ColumnId));
            var lastCol = board?.Columns.OrderBy(c => c.Position).LastOrDefault();
            return t.DueDate.Value < DateTime.UtcNow && (lastCol == null || t.ColumnId != lastCol.Id);
        });

        // Weekly chart
        var chartData = Enumerable.Range(0, 7).Select(offset =>
        {
            var date = DateTime.UtcNow.Date.AddDays(-6 + offset);
            return new
            {
                date = date.ToString("MMM dd"),
                completed = allTasks.Count(t =>
                {
                    var b = boards.FirstOrDefault(bd => bd.Columns.Any(c => c.Id == t.ColumnId));
                    var lc = b?.Columns.OrderBy(c => c.Position).LastOrDefault();
                    return lc != null && t.ColumnId == lc.Id && t.UpdatedAt.Date == date;
                })
            };
        }).ToList();

        // My tasks details
        var myTasksDetails = myTasks
            .OrderBy(t => t.DueDate ?? DateTime.MaxValue)
            .Take(20)
            .Select(t =>
            {
                var b = boards.FirstOrDefault(bd => bd.Columns.Any(c => c.Id == t.ColumnId));
                var col = b?.Columns.FirstOrDefault(c => c.Id == t.ColumnId);
                return new
                {
                    _id = t.Id,
                    title = t.Title,
                    priority = (int)t.Priority,
                    dueDate = t.DueDate,
                    boardId = b?.Id,
                    boardName = b?.Name,
                    columnName = col?.Title,
                    columnColor = col?.Color
                };
            }).ToList();

        // Recent boards
        var recentBoards = boards.OrderByDescending(b => b.CreatedAt).Take(6).Select(b => new
        {
            _id = b.Id,
            title = b.Name,
            taskCount = b.Columns.Sum(c => c.Tasks.Count),
            backgroundColor = b.BackgroundColor
        }).ToList();

        return Ok(new
        {
            totalBoards,
            assignedTasksCount = myTasks.Count,
            overdueTasksCount = overdueCount,
            myTasks = myTasksDetails,
            weeklyChart = chartData,
            recentBoards
        });
    }
}

// ─── Extra DTOs ──────────────────────────────────────────────────────────────

public record AddChecklistItemRequest
{
    public required string Title { get; init; }
    public Guid? AssigneeId { get; init; }
}
public record UpdateChecklistItemRequest
{
    public bool? IsCompleted { get; init; }
    public string? Title { get; init; }
    public Guid? AssigneeId { get; init; }
}
public record UpdatePriorityRequest { public Priority Priority { get; init; } }
public record UpdateDatesRequest
{
    public DateTime? StartDate { get; init; }
    public DateTime? DueDate { get; init; }
    public bool? ClearStartDate { get; init; }
    public bool? ClearDueDate { get; init; }
}
public record UpdateEstimationRequest { public int? EstimatedMinutes { get; init; } }
public record AddTimeLogRequest
{
    public int DurationMinutes { get; init; }
    public string? Note { get; init; }
    public DateTime? LoggedAt { get; init; }
}
