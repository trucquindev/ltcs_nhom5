using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Services;
using TaskFlow.Infrastructure.Data;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly AppDbContext _db;

    public AuthController(AuthService authService, AppDbContext db)
    {
        _authService = authService;
        _db = db;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var (user, error) = await _authService.RegisterAsync(
            request.Email, request.Password, request.DisplayName);

        if (error != null)
            return BadRequest(new { error });

        var token = _authService.GenerateToken(user!);

        return Ok(new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user!.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                AvatarUrl = user.AvatarUrl
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (user, error) = await _authService.LoginAsync(request.Email, request.Password);

        if (error != null)
            return Unauthorized(new { error });

        var token = _authService.GenerateToken(user!);

        return Ok(new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user!.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                AvatarUrl = user.AvatarUrl
            }
        });
    }

    /// <summary>
    /// Update current user's profile
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (request.DisplayName != null) user.DisplayName = request.DisplayName;
        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;

        await _db.SaveChangesAsync();

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl
        });
    }
}

// === DTOs ===
public record RegisterRequest
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    public required string DisplayName { get; init; }
}

public record LoginRequest
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}

public record AuthResponse
{
    public required string Token { get; init; }
    public required UserDto User { get; init; }
}

public record UserDto
{
    public Guid Id { get; init; }
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public string? AvatarUrl { get; init; }
}

public record UpdateProfileRequest
{
    public string? DisplayName { get; init; }
    public string? AvatarUrl { get; init; }
}
