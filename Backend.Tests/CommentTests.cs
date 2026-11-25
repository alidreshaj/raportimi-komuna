using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Tests;

// Biseda te raporti: kush mund të lexojë/shkruajë, dhe kush njoftohet për mesazhin e ri.
public class CommentTests
{
    private const int OwnerId = 1;
    private const int OtherCitizenId = 2;
    private const int AdminId = 3;
    private const int SecondAdminId = 4;

    private static (CommentService Comments, AppDbContext Db, int ReportId) Create()
    {
        var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

        db.Users.AddRange(
            new User { Id = OwnerId, Name = "Qytetari", Email = "q@test.local", PasswordHash = "x" },
            new User { Id = OtherCitizenId, Name = "Tjetri", Email = "t@test.local", PasswordHash = "x" },
            new User { Id = AdminId, Name = "Admini", Email = "a@test.local", PasswordHash = "x", Role = Role.Admin },
            new User { Id = SecondAdminId, Name = "Admini 2", Email = "a2@test.local", PasswordHash = "x", Role = Role.Admin });
        db.Categories.Add(new Category { Id = 1, Name = "Rrugë" });
        var report = new Report
        {
            Title = "Gropë në rrugë",
            Description = "Gropë e madhe",
            Location = "Rruga A",
            UserId = OwnerId,
            CategoryId = 1
        };
        db.Reports.Add(report);
        db.SaveChanges();

        return (new CommentService(db, new NotificationService(db)), db, report.Id);
    }

    private static CreateCommentDto Text(string text) => new() { Text = text };

    [Fact]
    public async Task QytetariTjeter_NukELexonDheNukShkruanTeRaportiIHuaj()
    {
        var (comments, db, reportId) = Create();

        Assert.Null(await comments.GetAsync(OtherCitizenId, false, reportId));
        Assert.Null(await comments.CreateAsync(OtherCitizenId, false, reportId, Text("Përshëndetje")));
        Assert.Empty(db.Comments);
        Assert.Empty(db.Notifications);
    }

    [Fact]
    public async Task RaportQeNukEkziston_KthenNull()
    {
        var (comments, _, _) = Create();

        Assert.Null(await comments.GetAsync(AdminId, true, 999));
        Assert.Null(await comments.CreateAsync(AdminId, true, 999, Text("Tekst")));
    }

    [Fact]
    public async Task MesazhiIQytetarit_NjoftonTeGjitheAdminetJoAutorin()
    {
        var (comments, db, reportId) = Create();

        var comment = await comments.CreateAsync(OwnerId, false, reportId, Text("  Ende s'është rregulluar.  "));

        Assert.NotNull(comment);
        Assert.Equal("Ende s'është rregulluar.", comment.Text);
        Assert.Equal("Qytetari", comment.AuthorName);
        Assert.Equal("Citizen", comment.AuthorRole);

        var notified = db.Notifications.Select(n => n.UserId).OrderBy(id => id).ToList();
        Assert.Equal([AdminId, SecondAdminId], notified);
        Assert.All(db.Notifications, n =>
        {
            Assert.Equal(NotificationType.NewComment, n.Type);
            Assert.Equal(reportId, n.ReportId);
            Assert.Contains("Qytetari", n.Message);
            Assert.Null(n.ReadAt);
        });
    }

    [Fact]
    public async Task MesazhiIAdminit_NjoftonVetemPronarin()
    {
        var (comments, db, reportId) = Create();

        var comment = await comments.CreateAsync(AdminId, true, reportId, Text("Po e shqyrtojmë."));

        Assert.NotNull(comment);
        Assert.Equal("Admin", comment.AuthorRole);
        var notification = Assert.Single(db.Notifications);
        Assert.Equal(OwnerId, notification.UserId);
        Assert.Contains("Gropë në rrugë", notification.Message);
    }

    [Fact]
    public async Task Komentet_KthehenNgaMeIVjetriTeMeIRiu()
    {
        var (comments, _, reportId) = Create();
        await comments.CreateAsync(OwnerId, false, reportId, Text("I pari"));
        await comments.CreateAsync(AdminId, true, reportId, Text("I dyti"));
        await comments.CreateAsync(OwnerId, false, reportId, Text("I treti"));

        var forOwner = await comments.GetAsync(OwnerId, false, reportId);
        var forAdmin = await comments.GetAsync(AdminId, true, reportId);

        Assert.Equal(["I pari", "I dyti", "I treti"], forOwner!.Select(c => c.Text));
        Assert.Equal(forOwner.Select(c => c.Id), forAdmin!.Select(c => c.Id));
    }
}
