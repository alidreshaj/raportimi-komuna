using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace Backend.Tests;

// "Edhe unë e kam këtë problem": rregullat e votimit dhe privatësia e listës së komunës.
public class VoteTests
{
    private const int OwnerId = 1;
    private const int VoterId = 2;
    private const int OtherVoterId = 3;

    private static (VoteService Votes, ReportService Reports, AppDbContext Db) Create()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new AppDbContext(options);

        db.Users.AddRange(
            new User { Id = OwnerId, Name = "Pronari Sekret", Email = "o@test.local", PasswordHash = "x" },
            new User { Id = VoterId, Name = "Votuesi", Email = "v@test.local", PasswordHash = "x" },
            new User { Id = OtherVoterId, Name = "Tjetri", Email = "t@test.local", PasswordHash = "x" });
        db.Categories.Add(new Category { Id = 1, Name = "Rrugë" });
        db.SaveChanges();

        var reports = new ReportService(db, null!, NullLogger<ReportService>.Instance, new NotificationService(db));
        return (new VoteService(db), reports, db);
    }

    private static Report AddReport(AppDbContext db, ReportStatus status = ReportStatus.New, string description = "Gropë")
    {
        var report = new Report
        {
            Title = "Gropë në rrugë",
            Description = description,
            Location = "Rruga A",
            UserId = OwnerId,
            CategoryId = 1,
            Status = status
        };
        db.Reports.Add(report);
        db.SaveChanges();
        return report;
    }

    [Fact]
    public async Task Vota_Numerohet_Dhe_PerseritjaNukENumeronDyHere()
    {
        var (votes, _, db) = Create();
        var report = AddReport(db);

        var (first, firstVote) = await votes.AddAsync(VoterId, report.Id);
        var (second, secondVote) = await votes.AddAsync(VoterId, report.Id);

        Assert.Equal(ReportActionResult.Success, first);
        Assert.Equal(ReportActionResult.Success, second);
        Assert.Equal(1, firstVote!.VoteCount);
        Assert.Equal(1, secondVote!.VoteCount);
        Assert.True(secondVote.HasVoted);
        Assert.Single(db.ReportVotes);
    }

    [Fact]
    public async Task DyQytetarVotojne_NumriEshteDy()
    {
        var (votes, _, db) = Create();
        var report = AddReport(db);

        await votes.AddAsync(VoterId, report.Id);
        var (_, vote) = await votes.AddAsync(OtherVoterId, report.Id);

        Assert.Equal(2, vote!.VoteCount);
    }

    [Fact]
    public async Task HeqjaEVotes_ZvogelonNumrin_Dhe_EshteIdempotente()
    {
        var (votes, _, db) = Create();
        var report = AddReport(db);
        await votes.AddAsync(VoterId, report.Id);

        var (result, vote) = await votes.RemoveAsync(VoterId, report.Id);
        var (again, againVote) = await votes.RemoveAsync(VoterId, report.Id);

        Assert.Equal(ReportActionResult.Success, result);
        Assert.Equal(0, vote!.VoteCount);
        Assert.False(vote.HasVoted);
        Assert.Equal(ReportActionResult.Success, again);
        Assert.Equal(0, againVote!.VoteCount);
    }

    [Fact]
    public async Task NukVotohetRaportiIVet()
    {
        var (votes, _, db) = Create();
        var report = AddReport(db);

        var (result, _) = await votes.AddAsync(OwnerId, report.Id);

        Assert.Equal(ReportActionResult.OwnReport, result);
        Assert.Empty(db.ReportVotes);
    }

    [Fact]
    public async Task NukVotohetRaportIZgjidhur_ApoIRefuzuar_ApoQeNukEkziston()
    {
        var (votes, _, db) = Create();
        var resolved = AddReport(db, ReportStatus.Resolved);
        var rejected = AddReport(db, ReportStatus.Rejected);

        Assert.Equal(ReportActionResult.VotingClosed, (await votes.AddAsync(VoterId, resolved.Id)).Result);
        // Raporti i refuzuar nuk shihet nga qytetarët, prandaj sillet si i paqenë (404).
        Assert.Equal(ReportActionResult.NotFound, (await votes.AddAsync(VoterId, rejected.Id)).Result);
        Assert.Equal(ReportActionResult.NotFound, (await votes.AddAsync(VoterId, 999)).Result);
        Assert.Empty(db.ReportVotes);
    }

    [Fact]
    public async Task VotaMundTeHiqetEdheKurRaportiUZgjidh()
    {
        var (votes, _, db) = Create();
        var report = AddReport(db, ReportStatus.InProgress);
        await votes.AddAsync(VoterId, report.Id);
        report.Status = ReportStatus.Resolved;
        db.SaveChanges();

        var (result, vote) = await votes.RemoveAsync(VoterId, report.Id);

        Assert.Equal(ReportActionResult.Success, result);
        Assert.Equal(0, vote!.VoteCount);
    }

    [Fact]
    public async Task ListaEKomunes_NukPercaktonTeRefuzuarat_NukKaEmrinEPronarit_DheShkurtonPershkrimin()
    {
        var (votes, reports, db) = Create();
        var open = AddReport(db, description: new string('a', 500));
        AddReport(db, ReportStatus.Rejected);
        await votes.AddAsync(VoterId, open.Id);

        var page = await reports.GetCommunityAsync(VoterId, new ReportQueryDto());

        var item = Assert.Single(page.Items);
        Assert.Equal(open.Id, item.Id);
        Assert.Equal(200, item.Description.Length);
        Assert.Equal(1, item.VoteCount);
        Assert.True(item.HasVoted);
        Assert.False(item.IsMine);
        Assert.DoesNotContain("Pronari Sekret", System.Text.Json.JsonSerializer.Serialize(page));
    }

    [Fact]
    public async Task ListaEKomunes_MarkonRaportetEVetaDheRadhitetSipasVotave()
    {
        var (votes, reports, db) = Create();
        var few = AddReport(db);
        var many = AddReport(db);
        await votes.AddAsync(VoterId, many.Id);
        await votes.AddAsync(OtherVoterId, many.Id);
        await votes.AddAsync(VoterId, few.Id);

        var page = await reports.GetCommunityAsync(OwnerId, new ReportQueryDto { Sort = "votes" });

        Assert.Equal([many.Id, few.Id], page.Items.Select(i => i.Id));
        Assert.All(page.Items, i => Assert.True(i.IsMine));
        Assert.Equal(2, page.Items[0].VoteCount);
    }
}
