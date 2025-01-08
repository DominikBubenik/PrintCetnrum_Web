using Microsoft.EntityFrameworkCore;
using PrintCetnrum_Web.Server.Models;

namespace PrintCetnrum_Web.Server.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        public DbSet<User> Users { get; set; }
        public DbSet<UserFile> UserFiles { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<User>().ToTable("users");
            builder.Entity<UserFile>().ToTable("user_files");
        }
    }
}
