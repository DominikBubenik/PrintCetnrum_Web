using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCetnrum_Web.Server.Migrations
{
    /// <inheritdoc />
    public partial class addphonetouser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Phone",
                table: "users");
        }
    }
}
