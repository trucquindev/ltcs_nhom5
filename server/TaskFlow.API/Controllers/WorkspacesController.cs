using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkspacesController : ControllerBase
{
    private readonly AppDbContext _db;

    public WorkspacesController(AppDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var workspaces = await _db.WorkspaceMembers
            .Where(wm => wm.UserId == userId)
            .Include(wm => wm.Workspace)
            .ThenInclude(w => w.Members)
            .ThenInclude(m => m.User)
            .Select(wm => new
            {
                wm.Workspace.Id,
                wm.Workspace.Name,
                wm.Workspace.Description,
                wm.Workspace.LogoUrl,
                wm.AccessLevel,
                MemberCount = wm.Workspace.Members.Count,
                Members = wm.Workspace.Members.Select(m => new
                {
                    m.User.Id,
                    m.User.DisplayName,
                    m.User.AvatarUrl
                }).Take(5)
            })
            .ToListAsync();

        return Ok(workspaces);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWorkspaceRequest request)
    {
        var userId = GetUserId();

        var workspace = new Workspace
        {
            Name = request.Name,
            Description = request.Description,
            OwnerId = userId
        };

        _db.Workspaces.Add(workspace);

        // Add owner as full access member
        _db.WorkspaceMembers.Add(new WorkspaceMember
        {
            WorkspaceId = workspace.Id,
            UserId = userId,
            AccessLevel = AccessLevel.FullAccess
        });

        // Create default Admin role
        var adminRole = new Role
        {
            WorkspaceId = workspace.Id,
            Name = "Admin",
            Description = "Full access to all workspace features",
            IsSystem = true
        };
        _db.Roles.Add(adminRole);

        await _db.SaveChangesAsync();

        return Ok(new { workspace.Id, workspace.Name });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();
        var workspace = await _db.Workspaces
            .Include(w => w.Members).ThenInclude(m => m.User)
            .Include(w => w.Boards)
            .FirstOrDefaultAsync(w => w.Id == id && w.Members.Any(m => m.UserId == userId));

        if (workspace == null) return NotFound();

        return Ok(new
        {
            workspace.Id,
            workspace.Name,
            workspace.Description,
            Members = workspace.Members.Select(m => new
            {
                MemberId = m.Id,
                UserId = m.User.Id,
                m.User.DisplayName,
                m.User.Email,
                m.User.AvatarUrl,
                m.AccessLevel
            }),
            Boards = workspace.Boards.OrderBy(b => b.Position).Select(b => new
            {
                b.Id,
                b.Name,
                b.Description,
                b.BackgroundColor
            })
        });
    }

    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetMembers(Guid id)
    {
        var members = await _db.WorkspaceMembers
            .Where(wm => wm.WorkspaceId == id)
            .Include(wm => wm.User)
            .Select(wm => new
            {
                wm.Id,
                UserId = wm.User.Id,
                wm.User.DisplayName,
                wm.User.Email,
                wm.User.AvatarUrl,
                wm.AccessLevel,
                wm.JoinedAt
            })
            .ToListAsync();

        return Ok(members);
    }

    /// <summary>
    /// Update workspace name/description
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWorkspaceRequest request)
    {
        var userId = GetUserId();
        var workspace = await _db.Workspaces
            .Include(w => w.Members)
            .FirstOrDefaultAsync(w => w.Id == id && w.Members.Any(m => m.UserId == userId && m.AccessLevel == AccessLevel.FullAccess));

        if (workspace == null) return NotFound();

        if (request.Name != null) workspace.Name = request.Name;
        if (request.Description != null) workspace.Description = request.Description;

        await _db.SaveChangesAsync();
        return Ok(new { workspace.Id, workspace.Name, workspace.Description });
    }

    /// <summary>
    /// Delete workspace (owner only)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        var workspace = await _db.Workspaces
            .FirstOrDefaultAsync(w => w.Id == id && w.OwnerId == userId);

        if (workspace == null) return NotFound();

        _db.Workspaces.Remove(workspace);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Add member to workspace by email
    /// </summary>
    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddMember(Guid id, [FromBody] AddWorkspaceMemberRequest request)
    {
        var userId = GetUserId();
        // Verify current user has FullAccess
        var hasAccess = await _db.WorkspaceMembers
            .AnyAsync(wm => wm.WorkspaceId == id && wm.UserId == userId && wm.AccessLevel == AccessLevel.FullAccess);

        if (!hasAccess) return Forbid();

        var userToAdd = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (userToAdd == null) return NotFound(new { message = "User not found with this email" });

        var existingMember = await _db.WorkspaceMembers
            .FirstOrDefaultAsync(wm => wm.WorkspaceId == id && wm.UserId == userToAdd.Id);

        if (existingMember != null) return BadRequest(new { message = "User is already a member" });

        var newMember = new WorkspaceMember
        {
            WorkspaceId = id,
            UserId = userToAdd.Id,
            AccessLevel = AccessLevel.CanEdit
        };
        _db.WorkspaceMembers.Add(newMember);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            MemberId = newMember.Id,
            UserId = userToAdd.Id,
            userToAdd.DisplayName,
            userToAdd.Email,
            userToAdd.AvatarUrl,
            newMember.AccessLevel,
            newMember.JoinedAt
        });
    }


}

public record CreateWorkspaceRequest
{
    public required string Name { get; init; }
    public string? Description { get; init; }
}

public record UpdateWorkspaceRequest
{
    public string? Name { get; init; }
    public string? Description { get; init; }
}

public record AddWorkspaceMemberRequest
{
    public required string Email { get; init; }
}

public record UpdateMemberRoleRequest
{
    public required AccessLevel AccessLevel { get; init; }
}
