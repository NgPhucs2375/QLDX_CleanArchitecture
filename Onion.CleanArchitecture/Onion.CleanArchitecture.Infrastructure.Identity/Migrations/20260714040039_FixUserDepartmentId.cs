using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onion.CleanArchitecture.Infrastructure.Identity.Migrations
{
    /// <inheritdoc />
    public partial class FixUserDepartmentId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE \"Identity\".\"User\" ALTER COLUMN \"DepartmentId\" TYPE integer USING 0;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "DepartmentId",
                schema: "Identity",
                table: "User",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");
        }
    }
}
