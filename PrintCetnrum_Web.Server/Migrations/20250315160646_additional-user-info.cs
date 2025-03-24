using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCetnrum_Web.Server.Migrations
{
    /// <inheritdoc />
    public partial class additionaluserinfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAccountActive",
                table: "users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PostCode",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "users");

            migrationBuilder.DropColumn(
                name: "IsAccountActive",
                table: "users");

            migrationBuilder.DropColumn(
                name: "PostCode",
                table: "users");

            migrationBuilder.DropColumn(
                name: "Street",
                table: "users");
        }
    }
}
