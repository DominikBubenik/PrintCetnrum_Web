using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCetnrum_Web.Server.Migrations
{
    /// <inheritdoc />
    public partial class ChangeOrderAtributes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_order_items_user_files_UserFileId",
                table: "order_items");

            migrationBuilder.DropIndex(
                name: "IX_order_items_UserFileId",
                table: "order_items");

            migrationBuilder.DropColumn(
                name: "UserFileId",
                table: "order_items");

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "order_items",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileName",
                table: "order_items");

            migrationBuilder.AddColumn<int>(
                name: "UserFileId",
                table: "order_items",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_order_items_UserFileId",
                table: "order_items",
                column: "UserFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_order_items_user_files_UserFileId",
                table: "order_items",
                column: "UserFileId",
                principalTable: "user_files",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
