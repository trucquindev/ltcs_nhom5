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
