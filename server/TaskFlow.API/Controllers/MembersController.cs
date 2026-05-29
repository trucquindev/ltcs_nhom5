using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/workspaces/{workspaceId}/members")]
[Authorize]
public class MembersController : ControllerBase
{
    private readonly AppDbContext _db;

    public MembersController(AppDbContext db) => _db = db;

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Invite a user to workspace by email
    /// </summary>
    [HttpPost("invite")]
    public async Task<IActionResult> InviteMember(Guid workspaceId, [FromBody] InviteMemberRequest request)
    {
        var userId = GetUserId();

        // Check caller has FullAccess
        var callerMember = await _db.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == workspaceId && m.UserId == userId);

        if (callerMember == null || callerMember.AccessLevel != AccessLevel.FullAccess)
            return Forbid();

        // Find user by email
        var invitedUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (invitedUser == null)
            return NotFound(new { message = $"User with email '{request.Email}' not found. They need to register first." });

        // Check if already a member
        var existing = await _db.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspaceId && m.UserId == invitedUser.Id);
        if (existing)
            return BadRequest(new { message = "User is already a member of this workspace." });

        var member = new WorkspaceMember
        {
            WorkspaceId = workspaceId,
            UserId = invitedUser.Id,
            AccessLevel = request.AccessLevel ?? AccessLevel.CanEdit
        };

        _db.WorkspaceMembers.Add(member);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            member.Id,
            UserId = invitedUser.Id,
            invitedUser.DisplayName,
            invitedUser.Email,
            invitedUser.AvatarUrl,
            member.AccessLevel,
            member.JoinedAt
        });
    }

    /// <summary>
    /// Update member access level
    /// </summary>
    [HttpPut("{memberId}/role")]
    public async Task<IActionResult> UpdateRole(Guid workspaceId, Guid memberId, [FromBody] UpdateRoleRequest request)
    {
        var userId = GetUserId();

        var callerMember = await _db.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == workspaceId && m.UserId == userId);

        if (callerMember == null || callerMember.AccessLevel != AccessLevel.FullAccess)
            return Forbid();

        var member = await _db.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.Id == memberId && m.WorkspaceId == workspaceId);

        if (member == null) return NotFound();

        // Don't allow changing owner's role
        var workspace = await _db.Workspaces.FindAsync(workspaceId);
        if (workspace != null && member.UserId == workspace.OwnerId)
            return BadRequest(new { message = "Cannot change the workspace owner's role." });

        member.AccessLevel = request.AccessLevel;
        await _db.SaveChangesAsync();

        return Ok(new { member.Id, member.AccessLevel });
    }

    /// <summary>
    /// Remove member from workspace
    /// </summary>
    [HttpDelete("{memberId}")]
    public async Task<IActionResult> RemoveMember(Guid workspaceId, Guid memberId)
    {
        var userId = GetUserId();

        var callerMember = await _db.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == workspaceId && m.UserId == userId);

        if (callerMember == null || callerMember.AccessLevel != AccessLevel.FullAccess)
            return Forbid();

        var member = await _db.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.Id == memberId && m.WorkspaceId == workspaceId);

        if (member == null) return NotFound();

        // Don't allow removing the owner
        var workspace = await _db.Workspaces.FindAsync(workspaceId);
        if (workspace != null && member.UserId == workspace.OwnerId)
            return BadRequest(new { message = "Cannot remove the workspace owner." });

        _db.WorkspaceMembers.Remove(member);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}

public record InviteMemberRequest
{
    public required string Email { get; init; }
    public AccessLevel? AccessLevel { get; init; }
}

public record UpdateRoleRequest
{
    public required AccessLevel AccessLevel { get; init; }
}
