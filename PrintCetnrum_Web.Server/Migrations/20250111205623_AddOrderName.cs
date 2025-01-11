using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCetnrum_Web.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OrderName",
                table: "orders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OrderName",
                table: "orders");
        }
    }
}
