using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCetnrum_Web.Server.Migrations
{
    /// <inheritdoc />
    public partial class addcoltouserfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDesignFile",
                table: "order_items",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDesignFile",
                table: "order_items");
        }
    }
}
