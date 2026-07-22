using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseRequestContactFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactName",
                table: "PurchaseRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "PurchaseRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "PurchaseRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "PurchaseRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingAddress",
                table: "PurchaseRequests",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactName",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "Reason",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "ShippingAddress",
                table: "PurchaseRequests");
        }
    }
}
