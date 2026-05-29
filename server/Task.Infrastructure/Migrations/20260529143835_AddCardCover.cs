using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCardCover : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Cover",
                table: "Tasks",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(5082), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(5087) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7764), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7768) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7797), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7797) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7801), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7801) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7806), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7806) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7817), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7818) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000013"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7821), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7821) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000014"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7838), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7838) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000015"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7842), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7843) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000021"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7847), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7848) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000022"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7851), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7852) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000023"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7855), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7855) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000031"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7858), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7858) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000032"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7862), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7862) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000033"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7865), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7866) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000041"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7873), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7873) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000042"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7877), new DateTime(2026, 5, 29, 14, 38, 33, 718, DateTimeKind.Utc).AddTicks(7877) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cover",
                table: "Tasks");

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 432, DateTimeKind.Utc).AddTicks(9917), new DateTime(2026, 5, 29, 14, 5, 7, 432, DateTimeKind.Utc).AddTicks(9923) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3140), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3141) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3170), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3170) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3189), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3190) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3194), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3194) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000012"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3206), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3207) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000013"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3212), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3212) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000014"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3216), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3216) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000015"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3219), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3220) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000021"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3225), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3225) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000022"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3229), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3229) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000023"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3237), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3237) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000031"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3242), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3242) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000032"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3247), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3247) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000033"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3252), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3252) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000041"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3256), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3256) });

            migrationBuilder.UpdateData(
                table: "Permissions",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000042"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3262), new DateTime(2026, 5, 29, 14, 5, 7, 433, DateTimeKind.Utc).AddTicks(3262) });
        }
    }
}
