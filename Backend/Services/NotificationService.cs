using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

// Krijon dhe lexon njoftimet. Metodat "Queue" vetëm i shtojnë njoftimet te konteksti dhe NUK e ruajnë: i ruan thirrësi,
// bashkë me veprimin (ndryshimin e statusit, komentin). Kështu ose ruhen të dyja, ose asnjëra: nuk ka status të ndryshuar pa njoftim.
public class NotificationService
{
    private const int MaxMessageLength = 300;

    private readonly AppDbContext _db;

    public NotificationService(AppDbContext db)
    {
        _db = db;
    }

    // Shkurton një titull për ta futur te një mesazh.
    public static string Short(string text, int max = 60)
    {
        var trimmed = text.Trim();
        return trimmed.Length <= max ? trimmed : trimmed[..(max - 1)].TrimEnd() + "…";
    }

    // Njoftim për një raport që ekziston tashmë.
    public void Queue(int userId, int reportId, NotificationType type, string message)
    {
        _db.Notifications.Add(new Notification
        {
            UserId = userId,
            ReportId = reportId,
            Type = type,
            Message = Short(message, MaxMessageLength)
        });
    }

    // Njoftim për një raport që sapo u shtua (ende pa Id): lidhja vendoset me objektin, EF e plotëson Id-në kur ruan.
    public async Task QueueForAdminsAsync(Report report, NotificationType type, string message)
    {
        foreach (var adminId in await AdminIdsAsync())
        {
            _db.Notifications.Add(new Notification
            {
                UserId = adminId,
                Report = report,
                Type = type,
                Message = Short(message, MaxMessageLength)
            });
        }
    }

    // Njoftim për të gjithë adminët, për një raport që ekziston.
    public async Task QueueForAdminsAsync(int reportId, NotificationType type, string message)
    {
        foreach (var adminId in await AdminIdsAsync())
        {
            Queue(adminId, reportId, type, message);
        }
    }

    private Task<List<int>> AdminIdsAsync()
    {
        return _db.Users.Where(u => u.Role == Role.Admin).Select(u => u.Id).ToListAsync();
    }

    // Njoftimet e përdoruesit, më të rejat të parat, dhe sa janë të palexuara gjithsej.
    public async Task<NotificationListDto> GetAsync(int userId, int limit)
    {
        var items = await _db.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ThenByDescending(n => n.Id)
            .Take(limit)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type.ToString(),
                Message = n.Message,
                ReportId = n.ReportId,
                CreatedAt = n.CreatedAt,
                IsRead = n.ReadAt != null
            })
            .ToListAsync();

        return new NotificationListDto { Items = items, UnreadCount = await UnreadCountAsync(userId) };
    }

    public Task<int> UnreadCountAsync(int userId)
    {
        return _db.Notifications.CountAsync(n => n.UserId == userId && n.ReadAt == null);
    }

    // Shënon një njoftim si të lexuar. Kthen false nëse nuk ekziston ose nuk është i këtij përdoruesi (404).
    public async Task<bool> MarkReadAsync(int userId, int id)
    {
        var exists = await _db.Notifications.AnyAsync(n => n.Id == id && n.UserId == userId);
        if (!exists)
        {
            return false;
        }

        var now = DateTime.UtcNow;
        await _db.Notifications
            .Where(n => n.Id == id && n.UserId == userId && n.ReadAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.ReadAt, now));

        return true;
    }

    public async Task MarkAllReadAsync(int userId)
    {
        var now = DateTime.UtcNow;
        await _db.Notifications
            .Where(n => n.UserId == userId && n.ReadAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.ReadAt, now));
    }
}
