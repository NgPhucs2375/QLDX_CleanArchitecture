using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePurchaseRequestItemsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM \"PurchaseRequestApprovers\";");
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequestItems_Products_ProductId",
                table: "PurchaseRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequestItems_ProductId",
                table: "PurchaseRequestItems");

            migrationBuilder.AddColumn<string>(
                name: "ProductCode",
                table: "PurchaseRequestItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductName",
                table: "PurchaseRequestItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductUnit",
                table: "PurchaseRequestItems",
                type: "text",
                nullable: true);

            // 1. Xóa luôn cột Role (kiểu chuỗi) cũ đi
            migrationBuilder.DropColumn(
                name: "Role",
                table: "PurchaseRequestApprovers");

            // 2. Tạo lại cột Role mới toanh với kiểu Số (Integer)
            migrationBuilder.AddColumn<int>(
                name: "Role",
                table: "PurchaseRequestApprovers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductCode",
                table: "PurchaseRequestItems");

            migrationBuilder.DropColumn(
                name: "ProductName",
                table: "PurchaseRequestItems");

            migrationBuilder.DropColumn(
                name: "ProductUnit",
                table: "PurchaseRequestItems");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "PurchaseRequestApprovers",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestItems_ProductId",
                table: "PurchaseRequestItems",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequestItems_Products_ProductId",
                table: "PurchaseRequestItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
