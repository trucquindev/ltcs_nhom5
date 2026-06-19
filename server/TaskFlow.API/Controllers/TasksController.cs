using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Hubs;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<BoardHub> _hubContext;

    public TasksController(AppDbContext db, IHubContext<BoardHub> hubContext)
    {
        _db = db;
        _hubContext = hubContext;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var task = await _db.Tasks
            .Include(t => t.SubTasks.OrderBy(st => st.Position))
                .ThenInclude(st => st.ChecklistItems.OrderBy(ci => ci.Position))
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .Include(t => t.Comments.OrderByDescending(c => c.CreatedAt)).ThenInclude(c => c.User)
            .Include(t => t.Properties).ThenInclude(p => p.PropertyDefinition)
            .Include(t => t.Column)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        return Ok(new
        {
            task.Id,
            task.Title,
            task.Description,
            task.Priority,
            task.StartDate,
            task.DueDate,
            task.Cover,
            task.StatusId,
            task.ColumnId,
            ColumnTitle = task.Column.Title,
            Assignees = task.Assignees.Select(a => new { a.User.Id, a.User.DisplayName, a.User.AvatarUrl }),
            SubTasks = task.SubTasks.Select(st => new
            {
                st.Id,
                st.Title,
                st.IsCompleted,
                st.Position,
                ChecklistItems = st.ChecklistItems.Select(ci => new
                {
                    ci.Id,
                    ci.Content,
                    ci.IsChecked,
                    ci.Position
                })
            }),
            Comments = task.Comments.Select(c => new
            {
                c.Id,
                c.Content,
                c.CreatedAt,
                User = new { c.User.Id, c.User.DisplayName, c.User.AvatarUrl }
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTaskRequest request)
    {
        var maxPosition = await _db.Tasks
            .Where(t => t.ColumnId == request.ColumnId)
            .MaxAsync(t => (int?)t.Position) ?? -1;

        var task = new TaskItem
        {
            ColumnId = request.ColumnId,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            Position = maxPosition + 1,
            CreatedById = GetUserId()
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        // Get boardId for SignalR
        var column = await _db.BoardColumns.FindAsync(request.ColumnId);
        if (column != null)
        {
            await _hubContext.Clients.Group($"board-{column.BoardId}").SendAsync("TaskCreated", new
            {
                task.Id,
                task.Title,
                task.Position,
                task.Priority,
                ColumnId = request.ColumnId
            });
        }

        return Ok(new { task.Id, task.Title, task.Position });
    }

    [HttpPut("{id}/move")]
    public async Task<IActionResult> Move(Guid id, [FromBody] MoveTaskRequest request)
    {
        var task = await _db.Tasks.Include(t => t.Column).FirstOrDefaultAsync(t => t.Id == id);
        if (task == null) return NotFound();

        var oldColumnId = task.ColumnId;
        var boardId = task.Column.BoardId;

        task.ColumnId = request.ColumnId;
        task.Position = request.Position;

        // Reposition other tasks in the target column
        var targetTasks = await _db.Tasks
            .Where(t => t.ColumnId == request.ColumnId && t.Id != id && t.Position >= request.Position)
            .OrderBy(t => t.Position)
            .ToListAsync();

        int pos = request.Position + 1;
        foreach (var t in targetTasks)
        {
            t.Position = pos++;
        }

        await _db.SaveChangesAsync();

        await _hubContext.Clients.Group($"board-{boardId}").SendAsync("TaskMoved", new
        {
            TaskId = id,
            OldColumnId = oldColumnId,
            NewColumnId = request.ColumnId,
            Position = request.Position
        });

        return Ok();
    }

    [HttpPost("{id}/assign")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignRequest request)
    {
        var existing = await _db.TaskAssignees.FindAsync(id, request.UserId);
        if (existing != null) return Ok();

        _db.TaskAssignees.Add(new TaskAssignee { TaskId = id, UserId = request.UserId });
        await _db.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("{id}/assign/{userId}")]
    public async Task<IActionResult> Unassign(Guid id, Guid userId)
    {
        var existing = await _db.TaskAssignees.FindAsync(id, userId);
        if (existing != null)
        {
            _db.TaskAssignees.Remove(existing);
            await _db.SaveChangesAsync();
        }
        return Ok();
    }

    [HttpPost("{id}/subtasks")]
    public async Task<IActionResult> AddSubTask(Guid id, [FromBody] AddSubTaskRequest request)
    {
        var maxPos = await _db.SubTasks.Where(st => st.TaskId == id).MaxAsync(st => (int?)st.Position) ?? -1;

        var subTask = new SubTask
        {
            TaskId = id,
            Title = request.Title,
            Position = maxPos + 1
        };

        _db.SubTasks.Add(subTask);
        await _db.SaveChangesAsync();

        return Ok(new { subTask.Id, subTask.Title, subTask.Position });
    }

    [HttpPut("subtasks/{subTaskId}/toggle")]
    public async Task<IActionResult> ToggleSubTask(Guid subTaskId)
    {
        var subTask = await _db.SubTasks.FindAsync(subTaskId);
        if (subTask == null) return NotFound();

        subTask.IsCompleted = !subTask.IsCompleted;
        await _db.SaveChangesAsync();

        return Ok(new { subTask.Id, subTask.IsCompleted });
    }

    [HttpPost("subtasks/{subTaskId}/checklist")]
    public async Task<IActionResult> AddChecklistItem(Guid subTaskId, [FromBody] AddChecklistRequest request)
    {
        var maxPos = await _db.ChecklistItems.Where(ci => ci.SubTaskId == subTaskId).MaxAsync(ci => (int?)ci.Position) ?? -1;

        var item = new ChecklistItem
        {
            SubTaskId = subTaskId,
            Content = request.Content,
            Position = maxPos + 1
        };

        _db.ChecklistItems.Add(item);
        await _db.SaveChangesAsync();

        return Ok(new { item.Id, item.Content, item.IsChecked });
    }

    [HttpPut("checklist/{itemId}/toggle")]
    public async Task<IActionResult> ToggleChecklistItem(Guid itemId)
    {
        var item = await _db.ChecklistItems.FindAsync(itemId);
        if (item == null) return NotFound();

        item.IsChecked = !item.IsChecked;
        await _db.SaveChangesAsync();

        return Ok(new { item.Id, item.IsChecked });
    }

    /// <summary>
    /// Add a comment to a task
    /// </summary>
    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddCommentRequest request)
    {
        var userId = GetUserId();
        var comment = new TaskComment
        {
            TaskId = id,
            UserId = userId,
            Content = request.Content
        };

        _db.TaskComments.Add(comment);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);

        return Ok(new
        {
            comment.Id,
            comment.Content,
            comment.CreatedAt,
            User = new { user!.Id, user.DisplayName, user.AvatarUrl }
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        if (request.Title != null) task.Title = request.Title;
        if (request.Description != null) task.Description = request.Description;
        if (request.Priority.HasValue) task.Priority = request.Priority.Value;
        if (request.StartDate.HasValue) task.StartDate = request.StartDate;
        if (request.DueDate.HasValue) task.DueDate = request.DueDate;
        if (request.StatusId.HasValue) task.StatusId = request.StatusId;

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return Ok();
    }
}

public record CreateTaskRequest
{
    public Guid ColumnId { get; init; }
    public required string Title { get; init; }
    public string? Description { get; init; }
    public Priority Priority { get; init; } = Priority.None;
    public DateTime? StartDate { get; init; }
    public DateTime? DueDate { get; init; }
}

public record MoveTaskRequest
{
    public Guid ColumnId { get; init; }
    public int Position { get; init; }
}

public record AssignRequest { public Guid UserId { get; init; } }
public record AddSubTaskRequest { public required string Title { get; init; } }
public record AddChecklistRequest { public required string Content { get; init; } }
public record AddCommentRequest { public required string Content { get; init; } }

public record UpdateTaskRequest
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public Priority? Priority { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? DueDate { get; init; }
    public Guid? StatusId { get; init; }
}
