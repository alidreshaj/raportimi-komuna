using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace Backend.Tests;

public class StatsTests
{
    private static (ReportService Service, AppDbContext Db) Create()
    {
        var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

        db.Users.AddRange(
            new User { Id = 1, Name = "Admin", Email = "a@test.local", PasswordHash = "x", Role = Role.Admin },
            new User { Id = 2, Name = "Qytetar", Email = "q@test.local", PasswordHash = "x" });
        db.Categories.Add(new Category { Id = 1, Name = "Rrugë" });
        db.SaveChanges();

        return (new ReportService(db, null!, NullLogger<ReportService>.Instance, new NotificationService(db)), db);
    }

    private static void AddResolved(AppDbContext db, double createdDaysAgo, double resolvedDaysAgo)
    {
        var report = new Report
        {
            Title = "T", Description = "D", Location = "L", UserId = 2, CategoryId = 1,
            Status = ReportStatus.Resolved,
            CreatedAt = DateTime.UtcNow.AddDays(-createdDaysAgo)
        };
        db.Reports.Add(report);
        db.StatusHistories.Add(new StatusHistory
        {
            Report = report,
            FromStatus = ReportStatus.InProgress,
            ToStatus = ReportStatus.Resolved,
            ChangedAt = DateTime.UtcNow.AddDays(-resolvedDaysAgo),
            ChangedByUserId = 1
        });
        db.SaveChanges();
    }

    [Fact]
    public async Task KohaMesatareEZgjidhjes_ENullKurAsnjeRaportNukEshteZgjidhur()
    {
        var (service, _) = Create();

        Assert.Null((await service.GetStatsAsync()).AverageResolutionDays);
    }

    [Fact]
    public async Task KohaMesatareEZgjidhjes_ELlogaritetNgaKrijimiDerteZgjidhja()
    {
        var (service, db) = Create();
        AddResolved(db, createdDaysAgo: 10, resolvedDaysAgo: 8); // 2 ditë
        AddResolved(db, createdDaysAgo: 9, resolvedDaysAgo: 5);  // 4 ditë

        Assert.Equal(3.0, (await service.GetStatsAsync()).AverageResolutionDays);
    }

    [Fact]
    public void KohaMesatare_PermbledhetNeSqlTePostgreSQL()
    {
        // Pa u lidhur me databazë: kontrollojmë vetëm që EF e kthen shprehjen në SQL (ndryshe do të hidhte gabim kur hapet statistika).
        using var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseNpgsql("Host=unused").Options);

        var sql = db.StatusHistories
            .Where(h => h.ToStatus == ReportStatus.Resolved)
            .Select(h => (double?)(h.ChangedAt - h.Report.CreatedAt).TotalDays)
            .ToQueryString();

        Assert.Contains("date_part", sql, StringComparison.OrdinalIgnoreCase);
    }
}
