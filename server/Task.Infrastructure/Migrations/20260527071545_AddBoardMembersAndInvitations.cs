using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBoardMembersAndInvitations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BoardInvitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BoardId = table.Column<Guid>(type: "uuid", nullable: false),
                    InviterId = table.Column<Guid>(type: "uuid", nullable: false),
                    InviteeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BoardInvitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BoardInvitations_Boards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "Boards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BoardInvitations_Users_InviteeId",
                        column: x => x.InviteeId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BoardInvitations_Users_InviterId",
                        column: x => x.InviterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BoardMembers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BoardId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsOwner = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BoardMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BoardMembers_Boards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "Boards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BoardMembers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(7740), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(7740) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8350), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8350) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8360), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8360) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8360), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8360) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8360), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8360) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8370), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8370) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000013"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8370), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8370) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000014"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8380), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8380) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000015"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8380), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8380) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000021"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8380), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8380) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000022"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8390), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8390) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000023"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8390), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8390) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000031"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8400), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8400) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000032"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8400), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8400) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000033"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8400), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8400) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000041"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8410), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8410) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000042"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8410), new DateTime(2026, 5, 27, 7, 15, 44, 889, DateTimeKind.Utc).AddTicks(8410) });

            migrationBuilder.CreateIndex(
                name: "IX_BoardInvitations_BoardId_InviterId_InviteeId",
                table: "BoardInvitations",
                columns: new[] { "BoardId", "InviterId", "InviteeId" });

            migrationBuilder.CreateIndex(
                name: "IX_BoardInvitations_InviteeId",
                table: "BoardInvitations",
                column: "InviteeId");

            migrationBuilder.CreateIndex(
                name: "IX_BoardInvitations_InviterId",
                table: "BoardInvitations",
                column: "InviterId");

            migrationBuilder.CreateIndex(
                name: "IX_BoardMembers_BoardId_UserId",
                table: "BoardMembers",
                columns: new[] { "BoardId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BoardMembers_UserId",
                table: "BoardMembers",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BoardInvitations");

            migrationBuilder.DropTable(
                name: "BoardMembers");

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(7226), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(7231) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9575), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9576) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9595), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9596) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9600), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9601) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9614), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9614) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9624), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9625) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000013"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9712), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9712) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000014"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9717), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9717) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000015"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9723), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9723) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000021"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9729), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9730) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000022"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9733), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9733) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000023"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9737), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9737) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000031"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9744), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9744) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000032"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9747), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9748) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000033"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9751), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9751) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000041"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9754), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9754) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000042"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9757), new DateTime(2026, 5, 13, 14, 46, 11, 442, DateTimeKind.Utc).AddTicks(9758) });
        }
    }
}
