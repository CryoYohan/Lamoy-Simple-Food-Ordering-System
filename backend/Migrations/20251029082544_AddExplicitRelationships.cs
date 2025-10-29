using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddExplicitRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MenuItems_MenuCategories_MenuCategoryCategoryId",
                table: "MenuItems");

            // migrationBuilder.DropForeignKey(
            //     name: "FK_OrderItems_MenuItems_MenuItemItemId",
            //     table: "OrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_UserId",
                table: "Orders");

            // migrationBuilder.DropIndex(
            //     name: "IX_OrderItems_MenuItemItemId",
            //     table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_MenuItems_MenuCategoryCategoryId",
                table: "MenuItems");

            // migrationBuilder.DropColumn(
            //     name: "MenuItemItemId",
            //     table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "MenuCategoryCategoryId",
                table: "MenuItems");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserName",
                table: "Users",
                column: "UserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_ItemId",
                table: "OrderItems",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_CategoryId",
                table: "MenuItems",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuCategories_Name",
                table: "MenuCategories",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MenuItems_MenuCategories_CategoryId",
                table: "MenuItems",
                column: "CategoryId",
                principalTable: "MenuCategories",
                principalColumn: "CategoryId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderItems_MenuItems_ItemId",
                table: "OrderItems",
                column: "ItemId",
                principalTable: "MenuItems",
                principalColumn: "ItemId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_UserId",
                table: "Orders",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MenuItems_MenuCategories_CategoryId",
                table: "MenuItems");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderItems_MenuItems_ItemId",
                table: "OrderItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_UserId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_UserName",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_OrderItems_ItemId",
                table: "OrderItems");

            migrationBuilder.DropIndex(
                name: "IX_MenuItems_CategoryId",
                table: "MenuItems");

            migrationBuilder.DropIndex(
                name: "IX_MenuCategories_Name",
                table: "MenuCategories");

            migrationBuilder.AlterColumn<int>(
                name: "Role",
                table: "Users",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            // migrationBuilder.AddColumn<int>(
            //     name: "MenuItemItemId",
            //     table: "OrderItems",
            //     type: "integer",
            //     nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MenuCategoryCategoryId",
                table: "MenuItems",
                type: "integer",
                nullable: true);

            // migrationBuilder.CreateIndex(
            //     name: "IX_OrderItems_MenuItemItemId",
            //     table: "OrderItems",
            //     column: "MenuItemItemId");

            migrationBuilder.CreateIndex(
                name: "IX_MenuItems_MenuCategoryCategoryId",
                table: "MenuItems",
                column: "MenuCategoryCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_MenuItems_MenuCategories_MenuCategoryCategoryId",
                table: "MenuItems",
                column: "MenuCategoryCategoryId",
                principalTable: "MenuCategories",
                principalColumn: "CategoryId");

            // migrationBuilder.AddForeignKey(
            //     name: "FK_OrderItems_MenuItems_MenuItemItemId",
            //     table: "OrderItems",
            //     column: "MenuItemItemId",
            //     principalTable: "MenuItems",
            //     principalColumn: "ItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_UserId",
                table: "Orders",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
