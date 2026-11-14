using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace Backend.Tests;

// Rregullat e statusit nga docs/plani.md, të provuara mbi një databazë në memorie (pa PostgreSQL).
public class ReportStatusTests
{
    private const int AdminId = 1;
    private const int CitizenId = 2;

    private static (ReportService Service, AppDbContext Db) Create()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new AppDbContext(options);

        db.Users.AddRange(
            new User { Id = AdminId, Name = "Admin", Email = "admin@test.local", PasswordHash = "x", Role = Role.Admin },
            new User { Id = CitizenId, Name = "Qytetar", Email = "q@test.local", PasswordHash = "x" });
        db.Categories.Add(new Category { Id = 1, Name = "Rrugë" });
        db.SaveChanges();

        // ImageFileService përdoret vetëm te fshirja e fotove, që këtu nuk provohet.
        var service = new ReportService(db, null!, NullLogger<ReportService>.Instance, new NotificationService(db));
        return (service, db);
    }

    private static Report AddReport(AppDbContext db, ReportStatus status)
    {
        var report = new Report
        {
            Title = "Gropë në rrugë",
            Description = "Gropë e madhe",
            Location = "Rruga A",
            UserId = CitizenId,
            CategoryId = 1,
            Status = status
        };
        db.Reports.Add(report);
        db.SaveChanges();
        return report;
    }

    [Fact]
    public async Task New_Te_InProgress_Lejohet_Dhe_Regjistrohet_Historiku_Dhe_Njoftimi()
    {
        var (service, db) = Create();
        var report = AddReport(db, ReportStatus.New);

        var (result, dto) = await service.UpdateStatusAsync(AdminId, report.Id, ReportStatus.InProgress, null);

        Assert.Equal(ReportActionResult.Success, result);
        Assert.Equal("InProgress", dto!.Status);
        var history = Assert.Single(db.StatusHistories);
        Assert.Equal(ReportStatus.New, history.FromStatus);
        Assert.Equal(ReportStatus.InProgress, history.ToStatus);
        var notification = Assert.Single(db.Notifications);
        Assert.Equal(CitizenId, notification.UserId);
        Assert.Equal(NotificationType.StatusChanged, notification.Type);
    }

    [Theory]
    [InlineData(ReportStatus.New, ReportStatus.Resolved)]        // nuk anashkalohet "InProgress"
    [InlineData(ReportStatus.InProgress, ReportStatus.Rejected)] // refuzohet vetëm kur është New
    [InlineData(ReportStatus.InProgress, ReportStatus.New)]      // nuk kthehet mbrapsht
    [InlineData(ReportStatus.Resolved, ReportStatus.InProgress)] // Resolved është i mbyllur
    [InlineData(ReportStatus.Rejected, ReportStatus.InProgress)] // Rejected është i mbyllur
    public async Task KalimiIPalejuar_KthenInvalidTransition_Dhe_NukNdryshonAsgje(ReportStatus from, ReportStatus to)
    {
        var (service, db) = Create();
        var report = AddReport(db, from);

        var (result, _) = await service.UpdateStatusAsync(AdminId, report.Id, to, "arsye");

        Assert.Equal(ReportActionResult.InvalidTransition, result);
        Assert.Equal(from, db.Reports.Single().Status);
        Assert.Empty(db.StatusHistories);
        Assert.Empty(db.Notifications);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Rejected_KerkonArsye(string? reason)
    {
        var (service, db) = Create();
        var report = AddReport(db, ReportStatus.New);

        var (result, _) = await service.UpdateStatusAsync(AdminId, report.Id, ReportStatus.Rejected, reason);

        Assert.Equal(ReportActionResult.ReasonRequired, result);
        Assert.Equal(ReportStatus.New, db.Reports.Single().Status);
    }

    [Fact]
    public async Task Rejected_MeArsye_RuanArsyenSiKoment()
    {
        var (service, db) = Create();
        var report = AddReport(db, ReportStatus.New);

        var (result, _) = await service.UpdateStatusAsync(AdminId, report.Id, ReportStatus.Rejected, "  Nuk është kompetencë e komunës  ");

        Assert.Equal(ReportActionResult.Success, result);
        var comment = Assert.Single(db.Comments);
        Assert.Equal("Nuk është kompetencë e komunës", comment.Text);
        Assert.Equal(AdminId, comment.UserId);
    }

    [Fact]
    public async Task RaportiQeNukEkziston_KthenNotFound()
    {
        var (service, _) = Create();

        var (result, _) = await service.UpdateStatusAsync(AdminId, 999, ReportStatus.InProgress, null);

        Assert.Equal(ReportActionResult.NotFound, result);
    }

    [Fact]
    public async Task Qytetari_NukNdryshonRaportinETjeterDheNukEShohNeListe()
    {
        var (service, db) = Create();
        var report = AddReport(db, ReportStatus.New);

        var (result, _) = await service.UpdateAsync(userId: 99, report.Id, new Backend.DTOs.UpdateReportDto
        {
            Title = "Ndryshuar",
            Description = "x",
            Location = "y",
            CategoryId = 1
        });

        Assert.Equal(ReportActionResult.NotFound, result);
        Assert.Equal("Gropë në rrugë", db.Reports.Single().Title);
        Assert.Null(await service.GetByIdAsync(userId: 99, isAdmin: false, report.Id));
        Assert.NotNull(await service.GetByIdAsync(userId: 99, isAdmin: true, report.Id));
    }

    [Fact]
    public async Task Qytetari_NukNdryshonRaportinKurNukEshteNew()
    {
        var (service, db) = Create();
        var report = AddReport(db, ReportStatus.InProgress);

        var (result, _) = await service.UpdateAsync(CitizenId, report.Id, new Backend.DTOs.UpdateReportDto
        {
            Title = "Ndryshuar",
            Description = "x",
            Location = "y",
            CategoryId = 1
        });

        Assert.Equal(ReportActionResult.NotEditable, result);
    }
}
