using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCetnrum_Web.Server.Migrations
{
    /// <inheritdoc />
    public partial class ChangeUserFileId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
    }
}
