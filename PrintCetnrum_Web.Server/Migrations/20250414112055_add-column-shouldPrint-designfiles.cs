using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PrintCetnrum_Web.Server.Migrations
{
    /// <inheritdoc />
    public partial class addcolumnshouldPrintdesignfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "prize_lists");

            migrationBuilder.AddColumn<bool>(
                name: "ShouldPrint",
                table: "design_files",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShouldPrint",
                table: "design_files");

            migrationBuilder.CreateTable(
                name: "prize_lists",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemName = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_prize_lists", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_prize_lists_ItemName",
                table: "prize_lists",
                column: "ItemName",
                unique: true);
        }
    }
}
