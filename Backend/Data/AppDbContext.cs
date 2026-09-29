using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Çdo DbSet është një tabelë në databazë.
    public DbSet<User> Users => Set<User>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Image> Images => Set<Image>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.Property(u => u.Name).IsRequired().HasMaxLength(100);
            e.Property(u => u.Email).IsRequired().HasMaxLength(200);
            e.Property(u => u.PasswordHash).IsRequired();

            // Nuk lejohen dy llogari me të njëjtin email.
            e.HasIndex(u => u.Email).IsUnique();

            // Roli ruhet si tekst ("Citizen", "Admin"), jo si numër.
            e.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.Property(c => c.Name).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<Report>(e =>
        {
            e.Property(r => r.Title).IsRequired().HasMaxLength(200);
            e.Property(r => r.Description).IsRequired().HasMaxLength(2000);
            e.Property(r => r.Location).IsRequired().HasMaxLength(300);
            e.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);

            // Nuk lejohet të fshihet përdoruesi ose kategoria nëse ka raporte.
            e.HasOne(r => r.User)
                .WithMany(u => u.Reports)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(r => r.Category)
                .WithMany(c => c.Reports)
                .HasForeignKey(r => r.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Comment>(e =>
        {
            e.Property(c => c.Text).IsRequired().HasMaxLength(1000);

            // Kur fshihet raporti, fshihen edhe komentet e tij.
            e.HasOne(c => c.Report)
                .WithMany(r => r.Comments)
                .HasForeignKey(c => c.ReportId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Image>(e =>
        {
            e.Property(i => i.FilePath).IsRequired().HasMaxLength(500);

            // Kur fshihet raporti, fshihen edhe fotot e tij.
            e.HasOne(i => i.Report)
                .WithMany(r => r.Images)
                .HasForeignKey(i => i.ReportId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
