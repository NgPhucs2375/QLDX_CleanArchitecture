using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequestCategories_PurchaseRequests_PurchaseRequestI~",
                table: "PurchaseRequestCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequestItems_Products_ProductId1",
                table: "PurchaseRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequestItems_PurchaseRequestCategories_RequestCateg~",
                table: "PurchaseRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequestLogs_PurchaseRequests_PurchaseRequestId1",
                table: "PurchaseRequestLogs");

            migrationBuilder.Sql("DROP TABLE IF EXISTS \"Budgets\" CASCADE;");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequestLogs_PurchaseRequestId1",
                table: "PurchaseRequestLogs");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequestItems_ProductId1",
                table: "PurchaseRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequestItems_RequestCategoryId",
                table: "PurchaseRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequestCategories_PurchaseRequestId1",
                table: "PurchaseRequestCategories");

            migrationBuilder.DropColumn(
                name: "PurchaseConfigId",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "PurchaseRequestId1",
                table: "PurchaseRequestLogs");

            migrationBuilder.DropColumn(
                name: "ProductId1",
                table: "PurchaseRequestItems");

            migrationBuilder.DropColumn(
                name: "RequestCategoryId",
                table: "PurchaseRequestItems");

            migrationBuilder.DropColumn(
                name: "PurchaseRequestId1",
                table: "PurchaseRequestCategories");

            // Sử dụng raw SQL để đổi kiểu dữ liệu. 
            // Lệnh USING 0 sẽ biến đổi toàn bộ ID cũ (Guid) thành số 0 để không bị lỗi ép kiểu.
            migrationBuilder.Sql("ALTER TABLE \"PurchaseRequests\" ALTER COLUMN \"DepartmentId\" TYPE integer USING 0;");

            migrationBuilder.AddColumn<int>(
                name: "ProposalConfigId",
                table: "PurchaseRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            // Dùng raw SQL để ép kiểu Guid → int với USING 0
            migrationBuilder.Sql("ALTER TABLE \"PurchaseRequestLogs\" ALTER COLUMN \"PurchaseRequestId\" TYPE integer USING 0;");

            migrationBuilder.Sql("ALTER TABLE \"PurchaseRequestItems\" ALTER COLUMN \"PurchaseRequestCategoryId\" TYPE integer USING 0;");

            migrationBuilder.Sql("ALTER TABLE \"PurchaseRequestItems\" ALTER COLUMN \"ProductId\" TYPE integer USING 0;");

            migrationBuilder.Sql("ALTER TABLE \"PurchaseRequestCategories\" ALTER COLUMN \"PurchaseRequestId\" TYPE integer USING 0;");

            migrationBuilder.Sql("ALTER TABLE \"PurchaseRequestCategories\" ALTER COLUMN \"CategoryId\" TYPE integer USING 0;");

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

            migrationBuilder.CreateTable(
                name: "PurchaseRequestApprovals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PurchaseRequestId = table.Column<int>(type: "integer", nullable: false),
                    ApproverId = table.Column<string>(type: "text", nullable: true),
                    ApproverName = table.Column<string>(type: "text", nullable: true),
                    FromStatus = table.Column<int>(type: "integer", nullable: false),
                    ToStatus = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: true),
                    Note = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    Created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseRequestApprovals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseRequestApprovals_PurchaseRequests_PurchaseRequestId",
                        column: x => x.PurchaseRequestId,
                        principalTable: "PurchaseRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseRequestApprovers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PurchaseRequestId = table.Column<int>(type: "integer", nullable: false),
                    ApproverId = table.Column<string>(type: "text", nullable: true),
                    ApproverName = table.Column<string>(type: "text", nullable: true),
                    Role = table.Column<string>(type: "text", nullable: true),
                    StepOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    Created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    LastModified = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseRequestApprovers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseRequestApprovers_PurchaseRequests_PurchaseRequestId",
                        column: x => x.PurchaseRequestId,
                        principalTable: "PurchaseRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestLogs_PurchaseRequestId",
                table: "PurchaseRequestLogs",
                column: "PurchaseRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestItems_ProductId",
                table: "PurchaseRequestItems",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestItems_PurchaseRequestCategoryId",
                table: "PurchaseRequestItems",
                column: "PurchaseRequestCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestCategories_PurchaseRequestId",
                table: "PurchaseRequestCategories",
                column: "PurchaseRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestApprovals_PurchaseRequestId",
                table: "PurchaseRequestApprovals",
                column: "PurchaseRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestApprovers_PurchaseRequestId",
                table: "PurchaseRequestApprovers",
                column: "PurchaseRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequestCategories_PurchaseRequests_PurchaseRequestId",
                table: "PurchaseRequestCategories",
                column: "PurchaseRequestId",
                principalTable: "PurchaseRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequestItems_Products_ProductId",
                table: "PurchaseRequestItems",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequestItems_PurchaseRequestCategories_PurchaseRequ~",
                table: "PurchaseRequestItems",
                column: "PurchaseRequestCategoryId",
                principalTable: "PurchaseRequestCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequestLogs_PurchaseRequests_PurchaseRequestId",
                table: "PurchaseRequestLogs",
                column: "PurchaseRequestId",
                principalTable: "PurchaseRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequestCategories_PurchaseRequests_PurchaseRequestId",
                table: "PurchaseRequestCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequestItems_Products_ProductId",
                table: "PurchaseRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequestItems_PurchaseRequestCategories_PurchaseRequ~",
                table: "PurchaseRequestItems");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseRequestLogs_PurchaseRequests_PurchaseRequestId",
                table: "PurchaseRequestLogs");

            migrationBuilder.DropTable(
                name: "PurchaseRequestApprovals");

            migrationBuilder.DropTable(
                name: "PurchaseRequestApprovers");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequestLogs_PurchaseRequestId",
                table: "PurchaseRequestLogs");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequestItems_ProductId",
                table: "PurchaseRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequestItems_PurchaseRequestCategoryId",
                table: "PurchaseRequestItems");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequestCategories_PurchaseRequestId",
                table: "PurchaseRequestCategories");

            migrationBuilder.DropColumn(
                name: "ProposalConfigId",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "RemainingAmount",
                table: "ConfigCategories");

            migrationBuilder.DropColumn(
                name: "UsedAmount",
                table: "ConfigCategories");

            migrationBuilder.AlterColumn<Guid>(
                name: "DepartmentId",
                table: "PurchaseRequests",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<Guid>(
                name: "PurchaseConfigId",
                table: "PurchaseRequests",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<Guid>(
                name: "PurchaseRequestId",
                table: "PurchaseRequestLogs",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "PurchaseRequestId1",
                table: "PurchaseRequestLogs",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PurchaseRequestCategoryId",
                table: "PurchaseRequestItems",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "ProductId",
                table: "PurchaseRequestItems",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "ProductId1",
                table: "PurchaseRequestItems",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RequestCategoryId",
                table: "PurchaseRequestItems",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "PurchaseRequestId",
                table: "PurchaseRequestCategories",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "CategoryId",
                table: "PurchaseRequestCategories",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "PurchaseRequestId1",
                table: "PurchaseRequestCategories",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Budgets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CategoryId1 = table.Column<int>(type: "integer", nullable: true),
                    DepartmentId1 = table.Column<int>(type: "integer", nullable: true),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModified = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    RemainingAmount = table.Column<decimal>(type: "numeric(18,6)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalQuota = table.Column<decimal>(type: "numeric(18,6)", nullable: false),
                    UsedAmount = table.Column<decimal>(type: "numeric(18,6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Budgets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Budgets_Categories_CategoryId1",
                        column: x => x.CategoryId1,
                        principalTable: "Categories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Budgets_Departments_DepartmentId1",
                        column: x => x.DepartmentId1,
                        principalTable: "Departments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestLogs_PurchaseRequestId1",
                table: "PurchaseRequestLogs",
                column: "PurchaseRequestId1");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestItems_ProductId1",
                table: "PurchaseRequestItems",
                column: "ProductId1");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestItems_RequestCategoryId",
                table: "PurchaseRequestItems",
                column: "RequestCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequestCategories_PurchaseRequestId1",
                table: "PurchaseRequestCategories",
                column: "PurchaseRequestId1");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_CategoryId1",
                table: "Budgets",
                column: "CategoryId1");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_DepartmentId1",
                table: "Budgets",
                column: "DepartmentId1");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequestCategories_PurchaseRequests_PurchaseRequestI~",
                table: "PurchaseRequestCategories",
                column: "PurchaseRequestId1",
                principalTable: "PurchaseRequests",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequestItems_Products_ProductId1",
                table: "PurchaseRequestItems",
                column: "ProductId1",
                principalTable: "Products",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequestItems_PurchaseRequestCategories_RequestCateg~",
                table: "PurchaseRequestItems",
                column: "RequestCategoryId",
                principalTable: "PurchaseRequestCategories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseRequestLogs_PurchaseRequests_PurchaseRequestId1",
                table: "PurchaseRequestLogs",
                column: "PurchaseRequestId1",
                principalTable: "PurchaseRequests",
                principalColumn: "Id");
        }
    }
}
