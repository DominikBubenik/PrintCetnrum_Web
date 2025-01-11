using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Models;
using PrintCetnrum_Web.Server.Models.OrderModels;
using PrintCetnrum_Web.Server.Models.UserModels;

namespace PrintCetnrum_Web.Server.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        public DbSet<User> Users { get; set; }
        public DbSet<UserFile> UserFiles { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<PrizeList> PrizeList { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<User>().ToTable("users");
            builder.Entity<UserFile>().ToTable("user_files");
            builder.Entity<Order>().ToTable("orders");
            builder.Entity<OrderItem>().ToTable("order_items");
            builder.Entity<PrizeList>().ToTable("prize_lists");

            // Specify decimal precision and scale for TotalPrice in the Order entity
            builder.Entity<Order>()
                .Property(o => o.TotalPrice)
                .HasPrecision(18, 2);

            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);  

            builder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict); 

            builder.Entity<PrizeList>()
                .HasIndex(p => p.ItemName)
                .IsUnique();
        }

    }
}
