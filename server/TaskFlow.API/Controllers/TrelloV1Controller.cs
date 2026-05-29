using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Hubs;
using TaskFlow.API.Services;
using TaskFlow.Domain.Entities;
using TaskFlow.Infrastructure.Data;

/// <summary>
/// Bridges the trello-web-2024 frontend API contract (/v1/*) to the LTCS TaskFlow backend.
/// Auth: Bearer token in Authorization header (same JWT as LTCS).
/// The FE sends cookies; we also accept Authorization header.
/// </summary>
namespace TaskFlow.API.Controllers;

// ─── Users ───────────────────────────────────────────────────────────────────

[ApiController]
[Route("v1/users")]
public class TrelloUsersController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly AppDbContext _db;

    public TrelloUsersController(AuthService authService, AppDbContext db)
    {
        _authService = authService;
        _db = db;
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// POST /v1/users/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] TrelloRegisterRequest req)
    {
        var (user, error) = await _authService.RegisterAsync(req.Email, req.Password, req.Email.Split('@')[0]);
        if (error != null) return Conflict(new { message = error });
        return Ok(new { email = user!.Email });
    }

    /// PUT /v1/users/verify  (email verification — LTCS has no email flow, auto-activate)
    [HttpPut("verify")]
    public async Task<IActionResult> Verify([FromBody] TrelloVerifyRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user == null) return NotFound(new { message = "Account not found" });
        // LTCS has no verifyToken; just return success
        return Ok(new { _id = user.Id, email = user.Email, displayName = user.DisplayName });
    }

    /// POST /v1/users/login  (called via redux loginUserAPI)
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] TrelloLoginRequest req)
    {
        var (user, error) = await _authService.LoginAsync(req.Email, req.Password);
        if (error != null) return UnprocessableEntity(new { message = error });

        var accessToken = _authService.GenerateToken(user!);
        // Set cookie for FE interceptor (httpOnly)
        Response.Cookies.Append("accessToken", accessToken, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = false,
            Expires = DateTimeOffset.UtcNow.AddDays(1)
        });
        return Ok(new
        {
            accessToken,
            _id = user!.Id,
            email = user.Email,
            username = user.Email.Split('@')[0],
            displayName = user.DisplayName,
            avatar = user.AvatarUrl,
            role = "client",
            isActive = true
        });
    }

    /// DELETE /v1/users/logout
    [HttpDelete("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("accessToken");
        Response.Cookies.Delete("refreshToken");
        return Ok();
    }

    /// GET /v1/users/refresh_token
    [HttpGet("refresh_token")]
    public IActionResult RefreshToken()
    {
        // LTCS uses short-lived tokens; return 410 to trigger logout on FE
        return StatusCode(410, new { message = "Token expired" });
    }

    /// PUT /v1/users/update  (profile / password / avatar)
    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> Update()
    {
        var userId = GetUserId();
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        // Handle multipart (avatar upload) or JSON (displayName / password)
        if (Request.HasFormContentType)
        {
            // Avatar upload — store URL if provided, otherwise skip
            var file = Request.Form.Files.GetFile("avatar");
            if (file != null)
            {
                // Cloudinary / storage not wired in LTCS; return current user unchanged
                return Ok(MapUser(user));
            }
        }
        else
        {
            var body = await Request.ReadFromJsonAsync<TrelloUpdateUserRequest>();
            if (body != null)
            {
                if (!string.IsNullOrEmpty(body.DisplayName)) user.DisplayName = body.DisplayName;
                if (!string.IsNullOrEmpty(body.NewPassword) && !string.IsNullOrEmpty(body.CurrentPassword))
                {
                    if (!BCrypt.Net.BCrypt.Verify(body.CurrentPassword, user.PasswordHash))
                        return UnprocessableEntity(new { message = "Your current password is incorrect" });
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(body.NewPassword);
                }
                await _db.SaveChangesAsync();
            }
        }

        return Ok(MapUser(user));
    }

    private static object MapUser(User u) => new
    {
        _id = u.Id,
        email = u.Email,
        username = u.Email.Split('@')[0],
        displayName = u.DisplayName,
        avatar = u.AvatarUrl,
        role = "client",
        isActive = true
    };
}

// ─── Boards ──────────────────────────────────────────────────────────────────

[ApiController]
[Route("v1/boards")]
[Authorize]
public class TrelloBoardsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<BoardHub> _hub;
    public TrelloBoardsController(AppDbContext db, IHubContext<BoardHub> hub) { _db = db; _hub = hub; }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// GET /v1/boards?page=1&itemsPerPage=12&q[title]=...
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int itemsPerPage = 12,
        [FromQuery(Name = "q[title]")] string? titleFilter = null)
    {
        var userId = GetUserId();

        // Only boards where this user is explicitly a BoardMember (owner or invited)
        var query = _db.BoardMembers
            .Where(bm => bm.UserId == userId)
            .Include(bm => bm.Board)
            .Select(bm => bm.Board);

        if (!string.IsNullOrEmpty(titleFilter))
            query = query.Where(b => b.Name.ToLower().Contains(titleFilter.ToLower()));

        var total = await query.CountAsync();
        var boards = await query
            .OrderBy(b => b.Name)
            .Skip((page - 1) * itemsPerPage)
            .Take(itemsPerPage)
            .Select(b => new
            {
                _id = b.Id,
                title = b.Name,
                description = b.Description ?? "",
                type = "public",
                slug = b.Name.ToLower().Replace(" ", "-")
            })
            .ToListAsync();

        return Ok(new { boards, totalBoards = total });
    }

    /// POST /v1/boards
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TrelloCreateBoardRequest req)
    {
        var userId = GetUserId();
        Guid workspaceId;

        if (req.WorkspaceId != null)
        {
            workspaceId = Guid.Parse(req.WorkspaceId);
            // Verify access
            var hasAccess = await _db.WorkspaceMembers
                .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId);
            if (!hasAccess) return Forbid();
        }
        else
        {
            // Find or create a default workspace for this user
            var workspace = await _db.WorkspaceMembers
                .Where(wm => wm.UserId == userId)
                .Include(wm => wm.Workspace)
                .Select(wm => wm.Workspace)
                .FirstOrDefaultAsync();

            if (workspace == null)
            {
                workspace = new Workspace { Name = "My Workspace", OwnerId = userId };
                _db.Workspaces.Add(workspace);
                _db.WorkspaceMembers.Add(new WorkspaceMember
                {
                    WorkspaceId = workspace.Id, UserId = userId,
                    AccessLevel = TaskFlow.Domain.Enums.AccessLevel.FullAccess
                });
                await _db.SaveChangesAsync();
            }
            workspaceId = workspace.Id;
        }

        var board = new Board
        {
            WorkspaceId = workspaceId,
            Name = req.Title,
            Description = req.Description,
            BackgroundColor = "#1a1a2e"
        };
        _db.Boards.Add(board);

        // Add creator as board owner
        _db.BoardMembers.Add(new BoardMember { BoardId = board.Id, UserId = userId, IsOwner = true });

        // Default columns
        var cols = new[] { "To Do", "In Progress", "Done" };
        for (int i = 0; i < cols.Length; i++)
            _db.BoardColumns.Add(new BoardColumn { BoardId = board.Id, Title = cols[i], Position = i, Color = "#6366f1" });

        await _db.SaveChangesAsync();

        return StatusCode(201, new { _id = board.Id, title = board.Name, slug = board.Name.ToLower().Replace(" ", "-") });
    }

    /// GET /v1/boards/:id  (full board with columns+cards)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();
        var board = await _db.Boards
            .Include(b => b.Columns.OrderBy(c => c.Position))
                .ThenInclude(c => c.Tasks.OrderBy(t => t.Position))
                    .ThenInclude(t => t.Assignees).ThenInclude(a => a.User)
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.Comments).ThenInclude(c => c.User)
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.SubTasks)
            .Include(b => b.Columns).ThenInclude(c => c.Tasks).ThenInclude(t => t.TimeLogs)
            .Include(b => b.BoardMembers).ThenInclude(bm => bm.User)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (board == null) return NotFound(new { message = "Board not found" });

        // Only board members can view
        if (!board.BoardMembers.Any(bm => bm.UserId == userId))
            return Forbid();

        var allUsers = board.BoardMembers.Select(bm => new
        {
            _id = bm.User.Id,
            email = bm.User.Email,
            displayName = bm.User.DisplayName,
            avatar = bm.User.AvatarUrl
        }).ToList();

        var ownerIds = board.BoardMembers.Where(bm => bm.IsOwner).Select(bm => bm.UserId.ToString()).ToList();
        var memberIds = board.BoardMembers.Select(bm => bm.UserId.ToString()).ToList();

        var columns = board.Columns.Select(c => new
        {
            _id = c.Id,
            boardId = board.Id,
            title = c.Title,
            cardOrderIds = c.Tasks.OrderBy(t => t.Position).Select(t => t.Id.ToString()).ToList(),
            cards = c.Tasks.OrderBy(t => t.Position).Select(t => new
            {
                _id = t.Id,
                boardId = board.Id,
                columnId = c.Id,
                title = t.Title,
                description = t.Description,
                cover = t.Cover,
                priority = (int)t.Priority,
                startDate = t.StartDate,
                dueDate = t.DueDate,
                estimatedMinutes = t.EstimatedMinutes,
                memberIds = t.Assignees.Select(a => a.UserId.ToString()).ToList(),
                comments = t.Comments.OrderByDescending(cm => cm.CreatedAt).Select(cm => new
                {
                    userId = cm.UserId.ToString(),
                    userDisplayName = cm.User?.DisplayName ?? "",
                    userAvatar = cm.User?.AvatarUrl,
                    content = cm.Content,
                    commentedAt = cm.CreatedAt
                }).ToList(),
                checklistItems = t.SubTasks.OrderBy(st => st.Position).Select(st => new
                {
                    _id = st.Id,
                    title = st.Title,
                    isCompleted = st.IsCompleted,
                    assigneeId = st.AssigneeId
                }).ToList(),
                totalTimeLoggedMinutes = t.TimeLogs.Sum(tl => tl.DurationMinutes)
            }).ToList()
        }).ToList();

        return Ok(new
        {
            _id = board.Id,
            title = board.Name,
            description = board.Description ?? "",
            type = "public",
            slug = board.Name.ToLower().Replace(" ", "-"),
            ownerIds,
            memberIds,
            columnOrderIds = board.Columns.OrderBy(c => c.Position).Select(c => c.Id.ToString()).ToList(),
            columns,
            owners = allUsers.Where(u => ownerIds.Contains(u._id.ToString())).ToList(),
            members = allUsers,
            FE_allUsers = allUsers
        });
    }

    /// PUT /v1/boards/:id
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] TrelloUpdateBoardRequest req)
    {
        var board = await _db.Boards.Include(b => b.Columns).FirstOrDefaultAsync(b => b.Id == id);
        if (board == null) return NotFound();

        if (req.ColumnOrderIds != null)
        {
            var ids = req.ColumnOrderIds.Select(Guid.Parse).ToList();
            for (int i = 0; i < ids.Count; i++)
            {
                var col = board.Columns.FirstOrDefault(c => c.Id == ids[i]);
                if (col != null) col.Position = i;
            }
            await _db.SaveChangesAsync();
            // Emit real-time to other board members
            await _hub.Clients.Group($"board-{id}")
                .SendAsync("ColumnReordered", req.ColumnOrderIds.Select((colId, i) => new { id = colId, position = i }));
        }
        else
        {
            await _db.SaveChangesAsync();
        }
        return Ok(new { _id = board.Id });
    }

    /// PUT /v1/boards/supports/moving_card
    [HttpPut("supports/moving_card")]
    public async Task<IActionResult> MoveCard([FromBody] TrelloMoveCardRequest req)
    {
        var card = await _db.Tasks.Include(t => t.Column).FirstOrDefaultAsync(t => t.Id == Guid.Parse(req.CurrentCardId));
        if (card == null) return NotFound();

        var boardId = card.Column.BoardId;
        var oldCol = card.ColumnId;
        card.ColumnId = Guid.Parse(req.NexColumnId);
        
        // Log activity
        var userId = GetUserId();
        _db.TaskActivities.Add(new TaskActivity
        {
            TaskId = card.Id,
            UserId = userId,
            Action = "Moved Card",
            OldValue = oldCol.ToString(),
            NewValue = req.NexColumnId
        });

        if (req.NexCardOrderIds != null)
        {
            var ids = req.NexCardOrderIds.Select(s => Guid.TryParse(s, out var g) ? g : Guid.Empty).Where(g => g != Guid.Empty).ToList();
            for (int i = 0; i < ids.Count; i++) { var t = await _db.Tasks.FindAsync(ids[i]); if (t != null) t.Position = i; }
        }
        if (req.PrevCardOrderIds != null)
        {
            var ids = req.PrevCardOrderIds.Select(s => Guid.TryParse(s, out var g) ? g : Guid.Empty).Where(g => g != Guid.Empty).ToList();
            for (int i = 0; i < ids.Count; i++) { var t = await _db.Tasks.FindAsync(ids[i]); if (t != null) t.Position = i; }
        }

        await _db.SaveChangesAsync();

        await _hub.Clients.Group($"board-{boardId}")
            .SendAsync("TaskMoved", new
            {
                taskId = req.CurrentCardId,
                oldColumnId = req.PrevColumnId,
                newColumnId = req.NexColumnId
            });

        return Ok(new { updateResult = "Successfully" });
    }

    /// GET /v1/boards/:boardId/chats
    [HttpGet("{boardId}/chats")]
    public async Task<IActionResult> GetChats(Guid boardId)
    {
        var userId = GetUserId();
        // Check if user is a member of the board
        if (!await _db.BoardMembers.AnyAsync(bm => bm.BoardId == boardId && bm.UserId == userId))
            return Forbid();

        var messages = await _db.BoardChatMessages
            .Where(m => m.BoardId == boardId)
            .Include(m => m.User)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new
            {
                _id = m.Id,
                boardId = m.BoardId,
                userId = m.UserId,
                userDisplayName = m.User.DisplayName,
                userAvatar = m.User.AvatarUrl,
                message = m.Message,
                createdAt = m.CreatedAt
            })
            .ToListAsync();

        return Ok(messages);
    }

    /// POST /v1/boards/:boardId/chats
    [HttpPost("{boardId}/chats")]
    public async Task<IActionResult> SendChat(Guid boardId, [FromBody] TrelloSendChatRequest req)
    {
        var userId = GetUserId();
        // Check if user is a member of the board
        if (!await _db.BoardMembers.AnyAsync(bm => bm.BoardId == boardId && bm.UserId == userId))
            return Forbid();

        var chat = new BoardChatMessage
        {
            BoardId = boardId,
            UserId = userId,
            Message = req.Message
        };

        _db.BoardChatMessages.Add(chat);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        var payload = new
        {
            _id = chat.Id,
            boardId = chat.BoardId,
            userId = chat.UserId,
            userDisplayName = user?.DisplayName ?? "",
            userAvatar = user?.AvatarUrl,
            message = chat.Message,
            createdAt = chat.CreatedAt
        };

        // Broadcast to group
        await _hub.Clients.Group($"board-{boardId}").SendAsync("ChatMessageReceived", payload);

        return StatusCode(201, payload);
    }
}

// ─── Columns ─────────────────────────────────────────────────────────────────

[ApiController]
[Route("v1/columns")]
[Authorize]
public class TrelloColumnsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<BoardHub> _hub;
    public TrelloColumnsController(AppDbContext db, IHubContext<BoardHub> hub) { _db = db; _hub = hub; }

    /// POST /v1/columns
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TrelloCreateColumnRequest req)
    {
        var boardId = Guid.Parse(req.BoardId);
        var maxPos = await _db.BoardColumns.Where(c => c.BoardId == boardId).MaxAsync(c => (int?)c.Position) ?? -1;
        var col = new BoardColumn { BoardId = boardId, Title = req.Title, Position = maxPos + 1, Color = "#6366f1" };
        _db.BoardColumns.Add(col);
        await _db.SaveChangesAsync();

        var payload = new
        {
            _id = col.Id,
            boardId = col.BoardId,
            title = col.Title,
            cardOrderIds = new List<string>(),
            cards = new List<object>()
        };

        // Broadcast creation to group
        await _hub.Clients.Group($"board-{boardId}").SendAsync("ColumnCreated", payload);

        return StatusCode(201, payload);
    }

    /// PUT /v1/columns/:id
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] TrelloUpdateColumnRequest req)
    {
        var col = await _db.BoardColumns.Include(c => c.Tasks).FirstOrDefaultAsync(c => c.Id == id);
        if (col == null) return NotFound();

        if (req.Title != null) col.Title = req.Title;

        if (req.CardOrderIds != null)
        {
            var ids = req.CardOrderIds.Select(s => Guid.TryParse(s, out var g) ? g : Guid.Empty).Where(g => g != Guid.Empty).ToList();
            for (int i = 0; i < ids.Count; i++)
            {
                var t = await _db.Tasks.FindAsync(ids[i]);
                if (t != null) t.Position = i;
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { _id = col.Id, title = col.Title });
    }

    /// DELETE /v1/columns/:id
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var col = await _db.BoardColumns.Include(c => c.Tasks).FirstOrDefaultAsync(c => c.Id == id);
        if (col == null) return NotFound(new { message = "Column not found" });
        _db.BoardColumns.Remove(col);
        await _db.SaveChangesAsync();
        return Ok(new { deleteResult = "Column deleted successfully !", err = 0 });
    }
}

// ─── Cards ───────────────────────────────────────────────────────────────────

[ApiController]
[Route("v1/cards")]
[Authorize]
public class TrelloCardsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<BoardHub> _hub;
    public TrelloCardsController(AppDbContext db, IHubContext<BoardHub> hub) { _db = db; _hub = hub; }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// POST /v1/cards
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TrelloCreateCardRequest req)
    {
        var colId = Guid.Parse(req.ColumnId);
        var boardId = Guid.Parse(req.BoardId);
        var maxPos = await _db.Tasks.Where(t => t.ColumnId == colId).MaxAsync(t => (int?)t.Position) ?? -1;
        var task = new TaskItem
        {
            ColumnId = colId,
            Title = req.Title,
            Position = maxPos + 1,
            CreatedById = GetUserId()
        };
        _db.Tasks.Add(task);
        
        _db.TaskActivities.Add(new TaskActivity
        {
            TaskId = task.Id,
            UserId = GetUserId(),
            Action = "Created Card",
            NewValue = task.Title
        });

        await _db.SaveChangesAsync();

        var payload = new
        {
            _id = task.Id,
            boardId,
            columnId = colId,
            title = task.Title,
            memberIds = new List<string>(),
            comments = new List<object>()
        };

        // Broadcast to group
        await _hub.Clients.Group($"board-{boardId}").SendAsync("CardCreated", payload);

        return StatusCode(201, payload);
    }

    /// PUT /v1/cards/:id
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id)
    {
        var task = await _db.Tasks
            .Include(t => t.Column)
            .Include(t => t.Assignees).ThenInclude(a => a.User)
            .Include(t => t.Comments).ThenInclude(c => c.User)
            .Include(t => t.SubTasks)
            .Include(t => t.TimeLogs)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (task == null) return NotFound();

        var userId = GetUserId();

        // Check if the user has permission to modify the card (must be assigned, creator of card, or board owner)
        var isCardMember = task.Assignees.Any(a => a.UserId == userId);
        var isCardCreator = task.CreatedById == userId;
        var isBoardOwner = await _db.BoardMembers.AnyAsync(bm => bm.BoardId == task.Column.BoardId && bm.UserId == userId && bm.IsOwner);

        if (!isCardMember && !isCardCreator && !isBoardOwner)
        {
            return StatusCode(403, new { message = "Only users in the card, the card creator, or the board owner can edit this card or comment." });
        }

        if (Request.HasFormContentType)
        {
            var form = await Request.ReadFormAsync();
            var file = form.Files.GetFile("cardCover");
            if (file != null && file.Length > 0)
            {
                var ext = Path.GetExtension(file.FileName);
                var filename = $"{Guid.NewGuid()}{ext}";
                
                // Get physical path to wwwroot/uploads
                var hostEnv = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>();
                var uploadsFolder = Path.Combine(hostEnv.ContentRootPath, "wwwroot", "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
                
                var filePath = Path.Combine(uploadsFolder, filename);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                
                // Set Cover property to URL
                task.Cover = $"/uploads/{filename}";
                await _db.SaveChangesAsync();
                
                // Also broadcast the update
                await _hub.Clients.Group($"board-{task.Column.BoardId}").SendAsync("CardUpdated", new { taskId = task.Id, cover = task.Cover });
            }
        }
        else
        {
            var body = await Request.ReadFromJsonAsync<TrelloUpdateCardRequest>();
            if (body != null)
            {
                if (body.Title != null) task.Title = body.Title;
                if (body.Description != null) task.Description = body.Description;

                if (body.CommentToAdd != null)
                {
                    var comment = new TaskComment
                    {
                        TaskId = id,
                        UserId = userId,
                        Content = body.CommentToAdd.Content
                    };
                    _db.TaskComments.Add(comment);
                    await _db.SaveChangesAsync();
                    // Reload
                    task = await _db.Tasks
                        .Include(t => t.Column)
                        .Include(t => t.Assignees).ThenInclude(a => a.User)
                        .Include(t => t.Comments).ThenInclude(c => c.User)
                        .Include(t => t.SubTasks)
                        .Include(t => t.TimeLogs)
                        .FirstOrDefaultAsync(t => t.Id == id);
                }

                if (body.IncomingMemberInfo != null)
                {
                    var memberId = Guid.Parse(body.IncomingMemberInfo.UserId);
                    if (body.IncomingMemberInfo.Action == "ADD")
                    {
                        if (!await _db.TaskAssignees.AnyAsync(ta => ta.TaskId == id && ta.UserId == memberId))
                            _db.TaskAssignees.Add(new TaskAssignee { TaskId = id, UserId = memberId });
                    }
                    else
                    {
                        var existing = await _db.TaskAssignees.FirstOrDefaultAsync(ta => ta.TaskId == id && ta.UserId == memberId);
                        if (existing != null) _db.TaskAssignees.Remove(existing);
                    }
                    await _db.SaveChangesAsync();
                    task = await _db.Tasks
                        .Include(t => t.Column)
                        .Include(t => t.Assignees).ThenInclude(a => a.User)
                        .Include(t => t.Comments).ThenInclude(c => c.User)
                        .Include(t => t.SubTasks)
                        .Include(t => t.TimeLogs)
                        .FirstOrDefaultAsync(t => t.Id == id);
                }
            }
        }

        await _db.SaveChangesAsync();

        if (task != null)
        {
            var cardPayload = MapCard(task);
            await _hub.Clients.Group($"board-{task.Column.BoardId}").SendAsync("TaskUpdated", cardPayload);
        }

        return Ok(MapCard(task!));
    }

    private static object MapCard(TaskItem t) => new
    {
        _id = t.Id,
        columnId = t.ColumnId,
        title = t.Title,
        description = t.Description,
        cover = t.Cover,
        priority = (int)t.Priority,
        startDate = t.StartDate,
        dueDate = t.DueDate,
        estimatedMinutes = t.EstimatedMinutes,
        memberIds = t.Assignees.Select(a => a.UserId.ToString()).ToList(),
        comments = t.Comments.OrderByDescending(c => c.CreatedAt).Select(c => new
        {
            userId = c.UserId.ToString(),
            userDisplayName = c.User?.DisplayName ?? "",
            userAvatar = c.User?.AvatarUrl,
            content = c.Content,
            commentedAt = c.CreatedAt
        }).ToList(),
        checklistItems = (t.SubTasks ?? Enumerable.Empty<SubTask>()).OrderBy(st => st.Position).Select(st => new
        {
            _id = st.Id,
            title = st.Title,
            isCompleted = st.IsCompleted,
            assigneeId = st.AssigneeId
        }).ToList(),
        totalTimeLoggedMinutes = t.TimeLogs?.Sum(tl => tl.DurationMinutes) ?? 0
    };
}

// ─── Invitations ─────────────────────────────────────────────────────────────

[ApiController]
[Route("v1/invitations")]
[Authorize]
public class TrelloInvitationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<BoardHub> _hub;
    public TrelloInvitationsController(AppDbContext db, IHubContext<BoardHub> hub)
    { _db = db; _hub = hub; }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// GET /v1/invitations  — pending invitations for current user
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var invitations = await _db.BoardInvitations
            .Where(i => i.InviteeId == userId)
            .Include(i => i.Board)
            .Include(i => i.Inviter)
            .Include(i => i.Invitee)
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new
            {
                _id = i.Id,
                inviterId = i.InviterId,
                inviteeId = i.InviteeId,
                type = "BOARD_INVITATION",
                boardInvitation = new { boardId = i.BoardId, status = i.Status },
                board = new { _id = i.Board.Id, title = i.Board.Name },
                inviter = new { _id = i.Inviter.Id, displayName = i.Inviter.DisplayName },
                invitee = new { _id = i.Invitee.Id, displayName = i.Invitee.DisplayName },
                createdAt = i.CreatedAt
            })
            .ToListAsync();

        return Ok(invitations);
    }

    /// POST /v1/invitations/board  — send invitation (PENDING, no board access yet)
    [HttpPost("board")]
    public async Task<IActionResult> InviteToBoard([FromBody] TrelloInviteBoardRequest req)
    {
        var inviterId = GetUserId();
        var invitee = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.InviteeEmail);
        if (invitee == null) return NotFound(new { message = "User not found" });

        var boardId = Guid.Parse(req.BoardId);
        var board = await _db.Boards.FindAsync(boardId);
        if (board == null) return NotFound(new { message = "Board not found" });

        // Check already a member
        if (await _db.BoardMembers.AnyAsync(bm => bm.BoardId == boardId && bm.UserId == invitee.Id))
            return BadRequest(new { message = "User is already a board member" });

        // Create pending invitation
        var invitation = new BoardInvitation
        {
            BoardId = boardId,
            InviterId = inviterId,
            InviteeId = invitee.Id,
            Status = "PENDING"
        };
        _db.BoardInvitations.Add(invitation);
        await _db.SaveChangesAsync();

        var inviter = await _db.Users.FindAsync(inviterId);
        var payload = new
        {
            _id = invitation.Id,
            inviterId = inviterId.ToString(),
            inviteeId = invitee.Id.ToString(),
            type = "BOARD_INVITATION",
            boardInvitation = new { boardId = req.BoardId, status = "PENDING" },
            board = new { _id = board.Id, title = board.Name },
            inviter = new { _id = inviterId, displayName = inviter?.DisplayName },
            invitee = new { _id = invitee.Id, displayName = invitee.DisplayName }
        };

        // Notify invitee via SignalR
        await _hub.Clients.User(invitee.Id.ToString()).SendAsync("BoardInvitationReceived", payload);

        return Ok(payload);
    }

    /// PUT /v1/invitations/board/:id  — accept or reject
    [HttpPut("board/{id}")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] TrelloUpdateInvitationRequest req)
    {
        var userId = GetUserId();
        var invitation = await _db.BoardInvitations
            .Include(i => i.Board)
            .FirstOrDefaultAsync(i => i.Id == id && i.InviteeId == userId);

        if (invitation == null) return NotFound();

        invitation.Status = req.Status;

        if (req.Status == "ACCEPTED")
        {
            // Only add to this specific board
            if (!await _db.BoardMembers.AnyAsync(bm => bm.BoardId == invitation.BoardId && bm.UserId == userId))
                _db.BoardMembers.Add(new BoardMember { BoardId = invitation.BoardId, UserId = userId, IsOwner = false });
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            _id = invitation.Id,
            boardInvitation = new { boardId = invitation.BoardId, status = invitation.Status }
        });
    }
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

public record TrelloRegisterRequest { public required string Email { get; init; } public required string Password { get; init; } }
public record TrelloLoginRequest { public required string Email { get; init; } public required string Password { get; init; } }
public record TrelloVerifyRequest { public required string Email { get; init; } public string? Token { get; init; } }
public record TrelloUpdateUserRequest
{
    public string? DisplayName { get; init; }
    public string? CurrentPassword { get; init; }
    public string? NewPassword { get; init; }
}
public record TrelloCreateBoardRequest
{
    public required string Title { get; init; }
    public string? Description { get; init; }
    public string? Type { get; init; }
    public string? WorkspaceId { get; init; }
}
public record TrelloUpdateBoardRequest { public List<string>? ColumnOrderIds { get; init; } }
public record TrelloMoveCardRequest
{
    public required string CurrentCardId { get; init; }
    public required string PrevColumnId { get; init; }
    public List<string>? PrevCardOrderIds { get; init; }
    public required string NexColumnId { get; init; }
    public List<string>? NexCardOrderIds { get; init; }
}
public record TrelloCreateColumnRequest { public required string Title { get; init; } public required string BoardId { get; init; } }
public record TrelloUpdateColumnRequest { public string? Title { get; init; } public List<string>? CardOrderIds { get; init; } }
public record TrelloCreateCardRequest { public required string Title { get; init; } public required string ColumnId { get; init; } public required string BoardId { get; init; } }
public record TrelloUpdateCardRequest
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public TrelloCommentDto? CommentToAdd { get; init; }
    public TrelloMemberActionDto? IncomingMemberInfo { get; init; }
}
public record TrelloCommentDto { public required string Content { get; init; } public string? UserDisplayName { get; init; } public string? UserAvatar { get; init; } }
public record TrelloMemberActionDto { public required string UserId { get; init; } public required string Action { get; init; } }
public record TrelloInviteBoardRequest { public required string InviteeEmail { get; init; } public required string BoardId { get; init; } }
public record TrelloUpdateInvitationRequest { public required string Status { get; init; } }
public record TrelloSendChatRequest { public required string Message { get; init; } }
