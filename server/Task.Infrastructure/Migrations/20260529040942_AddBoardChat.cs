using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBoardChat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BoardChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BoardId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BoardChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BoardChatMessages_Boards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "Boards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BoardChatMessages_Users_UserId",
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
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(1570), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(1570) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2230), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2230) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2240), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2240) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2250), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2250) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2250), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2250) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2260), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2260) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000013"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2260), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2260) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000014"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2270), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2270) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000015"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2270), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2270) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000021"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2280), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2280) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000022"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2280), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2280) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000023"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2280), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2280) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000031"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2290), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2290) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000032"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2290), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2290) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000033"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2300), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2300) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000041"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2300), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2300) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000042"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2300), new DateTime(2026, 5, 29, 4, 9, 41, 167, DateTimeKind.Utc).AddTicks(2300) });

            migrationBuilder.CreateIndex(
                name: "IX_BoardChatMessages_BoardId",
                table: "BoardChatMessages",
                column: "BoardId");

            migrationBuilder.CreateIndex(
                name: "IX_BoardChatMessages_UserId",
                table: "BoardChatMessages",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BoardChatMessages");

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
        }
    }
}
