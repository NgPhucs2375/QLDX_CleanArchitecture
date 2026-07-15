using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SyncModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConfigApprovers_Departments_DepartmentId1",
                table: "ConfigApprovers");

            migrationBuilder.DropForeignKey(
                name: "FK_ConfigApprovers_ProposalConfigs_ProposalConfigId1",
                table: "ConfigApprovers");

            migrationBuilder.DropForeignKey(
                name: "FK_ConfigCategories_Categories_CategoryId1",
                table: "ConfigCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_ConfigCategories_Departments_DepartmentId1",
                table: "ConfigCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_ConfigCategories_ProposalConfigs_ProposalConfigId1",
                table: "ConfigCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Categories_CategoryId1",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_CategoryId1",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_ConfigCategories_CategoryId1",
                table: "ConfigCategories");

            migrationBuilder.DropIndex(
                name: "IX_ConfigCategories_DepartmentId1",
                table: "ConfigCategories");

            migrationBuilder.DropIndex(
                name: "IX_ConfigCategories_ProposalConfigId1",
                table: "ConfigCategories");

            migrationBuilder.DropIndex(
                name: "IX_ConfigApprovers_DepartmentId1",
                table: "ConfigApprovers");

            migrationBuilder.DropIndex(
                name: "IX_ConfigApprovers_ProposalConfigId1",
                table: "ConfigApprovers");

            migrationBuilder.DropColumn(
                name: "CategoryId1",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "CategoryId1",
                table: "ConfigCategories");

            migrationBuilder.DropColumn(
                name: "DepartmentId1",
                table: "ConfigCategories");

            migrationBuilder.DropColumn(
                name: "ProposalConfigId1",
                table: "ConfigCategories");

            migrationBuilder.DropColumn(
                name: "DepartmentId1",
                table: "ConfigApprovers");

            migrationBuilder.DropColumn(
                name: "ProposalConfigId1",
                table: "ConfigApprovers");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "PurchaseRequestLogs",
                type: "text",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.Sql("ALTER TABLE \"Products\" ALTER COLUMN \"CategoryId\" TYPE integer USING 0;");

            migrationBuilder.Sql("ALTER TABLE \"ConfigCategories\" ALTER COLUMN \"ProposalConfigId\" TYPE integer USING 0;");

            migrationBuilder.Sql("ALTER TABLE \"ConfigCategories\" ALTER COLUMN \"DepartmentId\" TYPE integer USING 0;");

            migrationBuilder.Sql("ALTER TABLE \"ConfigCategories\" ALTER COLUMN \"CategoryId\" TYPE integer USING 0;");

            migrationBuilder.Sql("ALTER TABLE \"ConfigApprovers\" ALTER COLUMN \"ProposalConfigId\" TYPE integer USING 0;");

            migrationBuilder.Sql("ALTER TABLE \"ConfigApprovers\" ALTER COLUMN \"DepartmentId\" TYPE integer USING 0;");

            migrationBuilder.AlterColumn<string>(
                name: "ApproverId",
                table: "ConfigApprovers",
                type: "text",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigCategories_CategoryId",
                table: "ConfigCategories",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigCategories_DepartmentId",
                table: "ConfigCategories",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigCategories_ProposalConfigId",
                table: "ConfigCategories",
                column: "ProposalConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigApprovers_DepartmentId",
                table: "ConfigApprovers",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigApprovers_ProposalConfigId",
                table: "ConfigApprovers",
                column: "ProposalConfigId");

            migrationBuilder.AddForeignKey(
                name: "FK_ConfigApprovers_Departments_DepartmentId",
                table: "ConfigApprovers",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConfigApprovers_ProposalConfigs_ProposalConfigId",
                table: "ConfigApprovers",
                column: "ProposalConfigId",
                principalTable: "ProposalConfigs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConfigCategories_Categories_CategoryId",
                table: "ConfigCategories",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConfigCategories_Departments_DepartmentId",
                table: "ConfigCategories",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConfigCategories_ProposalConfigs_ProposalConfigId",
                table: "ConfigCategories",
                column: "ProposalConfigId",
                principalTable: "ProposalConfigs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Categories_CategoryId",
                table: "Products",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConfigApprovers_Departments_DepartmentId",
                table: "ConfigApprovers");

            migrationBuilder.DropForeignKey(
                name: "FK_ConfigApprovers_ProposalConfigs_ProposalConfigId",
                table: "ConfigApprovers");

            migrationBuilder.DropForeignKey(
                name: "FK_ConfigCategories_Categories_CategoryId",
                table: "ConfigCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_ConfigCategories_Departments_DepartmentId",
                table: "ConfigCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_ConfigCategories_ProposalConfigs_ProposalConfigId",
                table: "ConfigCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Categories_CategoryId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_CategoryId",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_ConfigCategories_CategoryId",
                table: "ConfigCategories");

            migrationBuilder.DropIndex(
                name: "IX_ConfigCategories_DepartmentId",
                table: "ConfigCategories");

            migrationBuilder.DropIndex(
                name: "IX_ConfigCategories_ProposalConfigId",
                table: "ConfigCategories");

            migrationBuilder.DropIndex(
                name: "IX_ConfigApprovers_DepartmentId",
                table: "ConfigApprovers");

            migrationBuilder.DropIndex(
                name: "IX_ConfigApprovers_ProposalConfigId",
                table: "ConfigApprovers");

            migrationBuilder.AlterColumn<Guid>(
                name: "UserId",
                table: "PurchaseRequestLogs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "CategoryId",
                table: "Products",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "CategoryId1",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ManagerId",
                table: "Departments",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ProposalConfigId",
                table: "ConfigCategories",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "DepartmentId",
                table: "ConfigCategories",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "CategoryId",
                table: "ConfigCategories",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "CategoryId1",
                table: "ConfigCategories",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId1",
                table: "ConfigCategories",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProposalConfigId1",
                table: "ConfigCategories",
                type: "integer",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "ProposalConfigId",
                table: "ConfigApprovers",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "DepartmentId",
                table: "ConfigApprovers",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<Guid>(
                name: "ApproverId",
                table: "ConfigApprovers",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DepartmentId1",
                table: "ConfigApprovers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProposalConfigId1",
                table: "ConfigApprovers",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId1",
                table: "Products",
                column: "CategoryId1");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigCategories_CategoryId1",
                table: "ConfigCategories",
                column: "CategoryId1");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigCategories_DepartmentId1",
                table: "ConfigCategories",
                column: "DepartmentId1");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigCategories_ProposalConfigId1",
                table: "ConfigCategories",
                column: "ProposalConfigId1");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigApprovers_DepartmentId1",
                table: "ConfigApprovers",
                column: "DepartmentId1");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigApprovers_ProposalConfigId1",
                table: "ConfigApprovers",
                column: "ProposalConfigId1");

            migrationBuilder.AddForeignKey(
                name: "FK_ConfigApprovers_Departments_DepartmentId1",
                table: "ConfigApprovers",
                column: "DepartmentId1",
                principalTable: "Departments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ConfigApprovers_ProposalConfigs_ProposalConfigId1",
                table: "ConfigApprovers",
                column: "ProposalConfigId1",
                principalTable: "ProposalConfigs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ConfigCategories_Categories_CategoryId1",
                table: "ConfigCategories",
                column: "CategoryId1",
                principalTable: "Categories",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ConfigCategories_Departments_DepartmentId1",
                table: "ConfigCategories",
                column: "DepartmentId1",
                principalTable: "Departments",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ConfigCategories_ProposalConfigs_ProposalConfigId1",
                table: "ConfigCategories",
                column: "ProposalConfigId1",
                principalTable: "ProposalConfigs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Categories_CategoryId1",
                table: "Products",
                column: "CategoryId1",
                principalTable: "Categories",
                principalColumn: "Id");
        }
    }
}
