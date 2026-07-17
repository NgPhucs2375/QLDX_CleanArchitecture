using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePurchaseRequestFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RemainingAmount",
                table: "ConfigCategories");

            migrationBuilder.DropColumn(
                name: "UsedAmount",
                table: "ConfigCategories");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "RemainingAmount",
                table: "ConfigCategories",
                type: "numeric(18,6)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "UsedAmount",
                table: "ConfigCategories",
                type: "numeric(18,6)",
                nullable: false,
                defaultValue: 0m);
        }
    }
}
