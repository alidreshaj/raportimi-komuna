using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

// Mbështetja e raporteve ("edhe unë e kam këtë problem"). Vota është idempotente: të shtypësh dy herë nuk e numëron dy herë.
public class VoteService
{
    // Njoftimi dërgohet vetëm kur numri i votave arrin një nga këto pragje, që i zoti të mos mbushet me njoftime.
    private static readonly int[] Milestones = [5, 10, 25];

    private readonly AppDbContext _db;
    private readonly NotificationService _notifications;

    public VoteService(AppDbContext db, NotificationService notifications)
    {
        _db = db;
        _notifications = notifications;
    }

    // Shton votën e qytetarit. Rregullat: raporti duhet të ekzistojë dhe të mos jetë i refuzuar (përndryshe 404, sepse qytetari
    // nuk e sheh), të mos jetë i vetë qytetarit dhe të jetë ende i hapur (New ose InProgress).
    public Task<(ReportActionResult Result, VoteResultDto? Vote)> AddAsync(int userId, int reportId)
    {
        return ChangeAsync(userId, reportId, add: true);
    }

    // Heq votën e qytetarit. Nëse nuk kishte votuar, nuk ndryshon asgjë.
    public Task<(ReportActionResult Result, VoteResultDto? Vote)> RemoveAsync(int userId, int reportId)
    {
        return ChangeAsync(userId, reportId, add: false);
    }

    private async Task<(ReportActionResult Result, VoteResultDto? Vote)> ChangeAsync(int userId, int reportId, bool add)
    {
        var report = await _db.Reports
            .AsNoTracking()
            .Where(r => r.Id == reportId && r.Status != ReportStatus.Rejected)
            .Select(r => new { r.UserId, r.Status, r.Title })
            .FirstOrDefaultAsync();

        if (report is null)
        {
            return (ReportActionResult.NotFound, null);
        }

        if (report.UserId == userId)
        {
            return (ReportActionResult.OwnReport, null);
        }

        // Heqja e votës lejohet gjithmonë; shtimi vetëm sa raporti është i hapur.
        if (add && report.Status == ReportStatus.Resolved)
        {
            return (ReportActionResult.VotingClosed, null);
        }

        var existing = await _db.ReportVotes.FirstOrDefaultAsync(v => v.ReportId == reportId && v.UserId == userId);

        if (add && existing is null)
        {
            _db.ReportVotes.Add(new ReportVote { ReportId = reportId, UserId = userId });
            await QueueMilestoneAsync(reportId, report.UserId, report.Title);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Dy kërkesa njëkohësisht: tjetra e shtoi votën para nesh. Qëllimi është arritur, nuk është gabim.
                _db.ChangeTracker.Clear();
            }
        }
        else if (!add && existing is not null)
        {
            _db.ReportVotes.Remove(existing);
            await _db.SaveChangesAsync();
        }

        return (ReportActionResult.Success, await ResultAsync(userId, reportId));
    }

    // Nëse kjo votë e bën numrin 5, 10 ose 25, i zoti njoftohet. Ruhet në të njëjtën ruajtje me votën.
    // Njoftimi i të njëjtit prag nuk përsëritet (p.sh. dikush voton, heq votën dhe voton sërish).
    private async Task QueueMilestoneAsync(int reportId, int ownerId, string title)
    {
        var count = await _db.ReportVotes.CountAsync(v => v.ReportId == reportId) + 1;
        if (!Milestones.Contains(count))
        {
            return;
        }

        var message = $"Raporti yt \"{NotificationService.Short(title)}\" mbështetet nga {count} qytetarë.";
        var alreadySent = await _db.Notifications.AnyAsync(n =>
            n.UserId == ownerId && n.ReportId == reportId && n.Type == NotificationType.ReportSupported && n.Message == message);

        if (!alreadySent)
        {
            _notifications.Queue(ownerId, reportId, NotificationType.ReportSupported, message);
        }
    }

    private async Task<VoteResultDto> ResultAsync(int userId, int reportId)
    {
        return new VoteResultDto
        {
            VoteCount = await _db.ReportVotes.CountAsync(v => v.ReportId == reportId),
            HasVoted = await _db.ReportVotes.AnyAsync(v => v.ReportId == reportId && v.UserId == userId)
        };
    }
}
