using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("v1/cards")]
[Authorize]
public class TrelloActivityController : ControllerBase
{
    private readonly AppDbContext _db;
    public TrelloActivityController(AppDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// GET /v1/cards/{id}/activity
    /// </summary>
    [HttpGet("{id}/activity")]
    public async Task<IActionResult> GetCardActivity(Guid id)
    {
        var activities = await _db.TaskActivities
            .Where(a => a.TaskId == id)
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new
            {
                a.Id,
                a.Action,
                a.OldValue,
                a.NewValue,
                a.CreatedAt,
                User = new
                {
                    a.User.Id,
                    a.User.DisplayName,
                    a.User.AvatarUrl
                }
            })
            .ToListAsync();

        return Ok(activities);
    }
}
