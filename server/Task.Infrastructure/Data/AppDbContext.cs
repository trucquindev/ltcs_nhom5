using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;

namespace TaskFlow.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<WorkspaceMember> WorkspaceMembers => Set<WorkspaceMember>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<MemberRole> MemberRoles => Set<MemberRole>();
    public DbSet<Board> Boards => Set<Board>();
    public DbSet<BoardColumn> BoardColumns => Set<BoardColumn>();
    public DbSet<StatusDefinition> StatusDefinitions => Set<StatusDefinition>();
    public DbSet<PropertyDefinition> PropertyDefinitions => Set<PropertyDefinition>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<SubTask> SubTasks => Set<SubTask>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();
    public DbSet<TaskAssignee> TaskAssignees => Set<TaskAssignee>();
    public DbSet<TaskProperty> TaskProperties => Set<TaskProperty>();
    public DbSet<TaskComment> TaskComments => Set<TaskComment>();
    public DbSet<TaskActivity> TaskActivities => Set<TaskActivity>();
    public DbSet<BoardMember> BoardMembers => Set<BoardMember>();
    public DbSet<BoardInvitation> BoardInvitations => Set<BoardInvitation>();
    public DbSet<BoardChatMessage> BoardChatMessages => Set<BoardChatMessage>();
    public DbSet<TaskTimeLog> TaskTimeLogs => Set<TaskTimeLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // === User ===
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256);
            e.Property(u => u.DisplayName).HasMaxLength(100);
        });

        // === Workspace ===
        modelBuilder.Entity<Workspace>(e =>
        {
            e.HasOne(w => w.Owner)
                .WithMany()
                .HasForeignKey(w => w.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // === WorkspaceMember ===
        modelBuilder.Entity<WorkspaceMember>(e =>
        {
            e.HasIndex(wm => new { wm.WorkspaceId, wm.UserId }).IsUnique();
            e.Property(wm => wm.AccessLevel)
                .HasConversion<string>()
                .HasMaxLength(20);
        });

        // === Role ===
        modelBuilder.Entity<Role>(e =>
        {
            e.Property(r => r.Name).HasMaxLength(100);
        });

        // === Permission ===
        modelBuilder.Entity<Permission>(e =>
        {
            e.HasIndex(p => p.Code).IsUnique();
            e.Property(p => p.Code).HasMaxLength(50);
            e.Property(p => p.Category).HasMaxLength(50);
        });

        // === RolePermission (composite key) ===
        modelBuilder.Entity<RolePermission>(e =>
        {
            e.HasKey(rp => new { rp.RoleId, rp.PermissionId });
            e.HasOne(rp => rp.Role).WithMany(r => r.RolePermissions).HasForeignKey(rp => rp.RoleId);
            e.HasOne(rp => rp.Permission).WithMany(p => p.RolePermissions).HasForeignKey(rp => rp.PermissionId);
        });

        // === MemberRole (composite key) ===
        modelBuilder.Entity<MemberRole>(e =>
        {
            e.HasKey(mr => new { mr.MemberId, mr.RoleId });
            e.HasOne(mr => mr.Member).WithMany(m => m.MemberRoles).HasForeignKey(mr => mr.MemberId);
            e.HasOne(mr => mr.Role).WithMany(r => r.MemberRoles).HasForeignKey(mr => mr.RoleId);
        });

        // === Board ===
        modelBuilder.Entity<Board>(e =>
        {
            e.Property(b => b.Name).HasMaxLength(200);
        });

        // === BoardMember ===
        modelBuilder.Entity<BoardMember>(e =>
        {
            e.HasIndex(bm => new { bm.BoardId, bm.UserId }).IsUnique();
        });

        // === BoardInvitation ===
        modelBuilder.Entity<BoardInvitation>(e =>
        {
            e.HasIndex(bi => new { bi.BoardId, bi.InviterId, bi.InviteeId });
        });

        // === BoardChatMessage ===
        modelBuilder.Entity<BoardChatMessage>(e =>
        {
            e.HasIndex(cm => cm.BoardId);
        });

        // === BoardColumn ===
        modelBuilder.Entity<BoardColumn>(e =>
        {
            e.Property(c => c.Title).HasMaxLength(100);
        });

        // === TaskItem ===
        modelBuilder.Entity<TaskItem>(e =>
        {
            e.ToTable("Tasks");
            e.Property(t => t.Title).HasMaxLength(500);
            e.Property(t => t.Priority).HasConversion<string>().HasMaxLength(20);
            e.HasOne(t => t.CreatedBy).WithMany().HasForeignKey(t => t.CreatedById).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.Status).WithMany().HasForeignKey(t => t.StatusId).OnDelete(DeleteBehavior.SetNull);
        });

        // === SubTask ===
        modelBuilder.Entity<SubTask>(e =>
        {
            e.Property(s => s.Title).HasMaxLength(500);
            e.HasOne(s => s.Assignee).WithMany().HasForeignKey(s => s.AssigneeId).OnDelete(DeleteBehavior.SetNull);
        });

        // === ChecklistItem ===
        modelBuilder.Entity<ChecklistItem>(e =>
        {
            e.Property(c => c.Content).HasMaxLength(500);
        });

        // === TaskAssignee (composite key) ===
        modelBuilder.Entity<TaskAssignee>(e =>
        {
            e.HasKey(ta => new { ta.TaskId, ta.UserId });
            e.HasOne(ta => ta.Task).WithMany(t => t.Assignees).HasForeignKey(ta => ta.TaskId);
            e.HasOne(ta => ta.User).WithMany(u => u.TaskAssignments).HasForeignKey(ta => ta.UserId);
        });

        // === TaskProperty ===
        modelBuilder.Entity<TaskProperty>(e =>
        {
            e.HasIndex(tp => new { tp.TaskId, tp.PropertyDefinitionId }).IsUnique();
            e.Property(tp => tp.Value).HasColumnType("jsonb");
        });

        // === PropertyDefinition ===
        modelBuilder.Entity<PropertyDefinition>(e =>
        {
            e.Property(pd => pd.Type).HasConversion<string>().HasMaxLength(20);
            e.Property(pd => pd.Options).HasColumnType("jsonb");
        });

        // === TaskTimeLog ===
        modelBuilder.Entity<TaskTimeLog>(e =>
        {
            e.HasOne(tl => tl.Task).WithMany(t => t.TimeLogs).HasForeignKey(tl => tl.TaskId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(tl => tl.User).WithMany().HasForeignKey(tl => tl.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        // Seed default permissions
        SeedPermissions(modelBuilder);
    }

    private static void SeedPermissions(ModelBuilder modelBuilder)
    {
        var permissions = new List<Permission>
        {
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), Code = "board:create", Name = "Create Board", Category = "Board" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), Code = "board:edit", Name = "Edit Board", Category = "Board" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000003"), Code = "board:delete", Name = "Delete Board", Category = "Board" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000004"), Code = "board:view", Name = "View Board", Category = "Board" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000011"), Code = "task:create", Name = "Create Task", Category = "Task" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000012"), Code = "task:edit", Name = "Edit Task", Category = "Task" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000013"), Code = "task:delete", Name = "Delete Task", Category = "Task" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000014"), Code = "task:assign", Name = "Assign Task", Category = "Task" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000015"), Code = "task:move", Name = "Move Task", Category = "Task" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000021"), Code = "member:invite", Name = "Invite Member", Category = "Member" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000022"), Code = "member:remove", Name = "Remove Member", Category = "Member" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000023"), Code = "member:edit_role", Name = "Edit Member Role", Category = "Member" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000031"), Code = "role:create", Name = "Create Role", Category = "Role" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000032"), Code = "role:edit", Name = "Edit Role", Category = "Role" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000033"), Code = "role:delete", Name = "Delete Role", Category = "Role" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000041"), Code = "workspace:settings", Name = "Workspace Settings", Category = "Workspace" },
            new() { Id = Guid.Parse("10000000-0000-0000-0000-000000000042"), Code = "workspace:delete", Name = "Delete Workspace", Category = "Workspace" },
        };

        modelBuilder.Entity<Permission>().HasData(permissions);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is Domain.Common.BaseEntity &&
                        (e.State == EntityState.Added || e.State == EntityState.Modified));

        foreach (var entry in entries)
        {
            var entity = (Domain.Common.BaseEntity)entry.Entity;
            entity.UpdatedAt = DateTime.UtcNow;

            if (entry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }
        }
    }
}
