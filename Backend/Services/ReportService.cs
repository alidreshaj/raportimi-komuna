using System.Linq.Expressions;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ReportService
{
    private readonly AppDbContext _db;
    private readonly ImageFileService _files;
    private readonly ILogger<ReportService> _logger;

    public ReportService(AppDbContext db, ImageFileService files, ILogger<ReportService> logger)
    {
        _db = db;
        _files = files;
        _logger = logger;
    }

    // Si kthehet një Report në ReportDto. E shkruajmë një herë dhe e ripërdorim te çdo lexim.
    private static readonly Expression<Func<Report, ReportDto>> ToDto = r => new ReportDto
    {
        Id = r.Id,
        Title = r.Title,
        Description = r.Description,
        Location = r.Location,
        Latitude = r.Latitude,
        Longitude = r.Longitude,
        Status = r.Status.ToString(),
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt,
        CategoryId = r.CategoryId,
        CategoryName = r.Category.Name,
        ReporterName = r.User.Name,
        Images = r.Images
            .OrderBy(i => i.UploadedAt)
            .ThenBy(i => i.Id)
            .Select(i => new ImageDto
            {
                Id = i.Id,
                UploadedAt = i.UploadedAt,
                Url = "/api/reports/" + r.Id.ToString() + "/images/" + i.Id.ToString()
            })
            .ToList()
    };

    // Krijon raport të ri për përdoruesin e loguar. Kthen null nëse kategoria nuk ekziston.
    public async Task<ReportDto?> CreateAsync(int userId, CreateReportDto dto)
    {
        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
        {
            return null;
        }

        var report = new Report
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Location = dto.Location.Trim(),
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            CategoryId = dto.CategoryId,
            UserId = userId,          // nga tokeni, jo nga klienti
            Status = ReportStatus.New // gjithmonë New në fillim
        };

        _db.Reports.Add(report);
        await _db.SaveChangesAsync();

        return await _db.Reports
            .AsNoTracking()
            .Where(r => r.Id == report.Id)
            .Select(ToDto)
            .FirstAsync();
    }

    // Raportet e përdoruesit të loguar, më të rejat të parat.
    public async Task<List<ReportDto>> GetMyAsync(int userId)
    {
        return await _db.Reports
            .AsNoTracking()
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(ToDto)
            .ToListAsync();
    }

    // Të gjitha raportet (për Admin), me filtra opsionalë. Më të rejat të parat.
    public async Task<List<ReportDto>> GetAllAsync(ReportStatus? status, int? categoryId, DateOnly? from, DateOnly? to)
    {
        var query = _db.Reports.AsNoTracking().AsQueryable();

        // Shtojmë një kusht vetëm për filtrat që klienti i ka dhënë.
        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(r => r.CategoryId == categoryId.Value);
        }

        if (from.HasValue)
        {
            var start = from.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(r => r.CreatedAt >= start);
        }

        if (to.HasValue)
        {
            // "to" përfshin gjithë ditën, prandaj marrim fillimin e ditës tjetër.
            var endExclusive = to.Value.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(r => r.CreatedAt < endExclusive);
        }

        return await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(ToDto)
            .ToListAsync();
    }

    // Rrugët e lejuara të statusit (nga docs/plani.md): New → InProgress → Resolved, ose New → Rejected.
    // Resolved dhe Rejected janë të mbyllura, nuk ndryshojnë më.
    private static readonly Dictionary<ReportStatus, ReportStatus[]> AllowedTransitions = new()
    {
        [ReportStatus.New] = [ReportStatus.InProgress, ReportStatus.Rejected],
        [ReportStatus.InProgress] = [ReportStatus.Resolved],
        [ReportStatus.Resolved] = [],
        [ReportStatus.Rejected] = []
    };

    // Admini ndryshon statusin e çdo raporti, vetëm sipas rrugëve të lejuara.
    // Rejected kërkon arsye. Arsyeja (nëse ka) ruhet si koment nga admini.
    public async Task<(ReportActionResult Result, ReportDto? Report)> UpdateStatusAsync(
        int adminId, int id, ReportStatus newStatus, string? reason)
    {
        var report = await _db.Reports.FirstOrDefaultAsync(r => r.Id == id);
        if (report is null)
        {
            return (ReportActionResult.NotFound, null);
        }

        if (!AllowedTransitions[report.Status].Contains(newStatus))
        {
            return (ReportActionResult.InvalidTransition, null);
        }

        var hasReason = !string.IsNullOrWhiteSpace(reason);
        if (newStatus == ReportStatus.Rejected && !hasReason)
        {
            return (ReportActionResult.ReasonRequired, null);
        }

        // Ruajmë historikun përpara se ta mbishkruajmë statusin: pas mbishkrimit vlera e vjetër humbet.
        _db.StatusHistories.Add(new StatusHistory
        {
            ReportId = id,
            FromStatus = report.Status,
            ToStatus = newStatus,
            ChangedByUserId = adminId
        });

        report.Status = newStatus;
        report.UpdatedAt = DateTime.UtcNow;

        if (hasReason)
        {
            _db.Comments.Add(new Comment
            {
                Text = reason!.Trim(),
                ReportId = id,
                UserId = adminId
            });
        }

        // Një ruajtje e vetme: ose ruhen të gjitha (statusi, historiku dhe komenti), ose asnjëra.
        await _db.SaveChangesAsync();

        var updated = await _db.Reports
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(ToDto)
            .FirstAsync();

        return (ReportActionResult.Success, updated);
    }

    // Ndryshon raportin e vet. Lejohet vetëm kur statusi është New.
    public async Task<(ReportActionResult Result, ReportDto? Report)> UpdateAsync(int userId, int id, UpdateReportDto dto)
    {
        // Pronësia: gjejmë vetëm raportin që është i këtij përdoruesi.
        var report = await _db.Reports.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
        if (report is null)
        {
            return (ReportActionResult.NotFound, null);
        }

        if (report.Status != ReportStatus.New)
        {
            return (ReportActionResult.NotEditable, null);
        }

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists)
        {
            return (ReportActionResult.InvalidCategory, null);
        }

        report.Title = dto.Title.Trim();
        report.Description = dto.Description.Trim();
        report.Location = dto.Location.Trim();
        report.Latitude = dto.Latitude;
        report.Longitude = dto.Longitude;
        report.CategoryId = dto.CategoryId;
        report.UpdatedAt = DateTime.UtcNow; // CreatedAt nuk ndryshon

        await _db.SaveChangesAsync();

        var updated = await _db.Reports
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(ToDto)
            .FirstAsync();

        return (ReportActionResult.Success, updated);
    }

    // Fshin raportin e vet. Lejohet vetëm kur statusi është New.
    public async Task<ReportActionResult> DeleteAsync(int userId, int id)
    {
        var report = await _db.Reports.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
        if (report is null)
        {
            return ReportActionResult.NotFound;
        }

        if (report.Status != ReportStatus.New)
        {
            return ReportActionResult.NotEditable;
        }

        // Emrat e file-ve i lexojmë PARA fshirjes: pasi rreshtat të ikin, nuk kemi ku t'i gjejmë.
        var fileNames = await _db.Images
            .Where(i => i.ReportId == id)
            .Select(i => i.FilePath)
            .ToListAsync();

        // Databaza e para: raporti dhe rreshtat e fotove (Cascade) fshihen. Nëse dështon, asgjë nuk ka ndryshuar.
        _db.Reports.Remove(report);
        await _db.SaveChangesAsync();

        // Pastaj file-t nga disku. Nëse një file nuk fshihet, mbetet vetëm një file i tepërt (jetim):
        // e regjistrojmë, por përdoruesi merr sukses, sepse raporti u fshi.
        foreach (var fileName in fileNames)
        {
            try
            {
                _files.Delete(fileName);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Nuk u fshi file-i {FileName} i raportit të fshirë {ReportId}.", fileName, id);
            }
        }

        return ReportActionResult.Success;
    }

    // Një raport sipas id-së. Admin sheh çdo raport, qytetari vetëm të vetët.
    // Raporti i dikujt tjetër kthehet si null (404), njëlloj si ai që nuk ekziston.
    public async Task<ReportDto?> GetByIdAsync(int userId, bool isAdmin, int id)
    {
        return await _db.Reports
            .AsNoTracking()
            .Where(r => r.Id == id && (isAdmin || r.UserId == userId))
            .Select(ToDto)
            .FirstOrDefaultAsync();
    }

    // Historiku i ndryshimeve të statusit, nga më i vjetri te më i riu (i zoti i raportit ose Admin).
    // Kthen null nëse raporti nuk ekziston ose nuk është i këtij përdoruesi (404). Lista bosh = pa ndryshime ende.
    public async Task<List<StatusHistoryDto>?> GetHistoryAsync(int userId, bool isAdmin, int id)
    {
        var canAccess = await _db.Reports.AnyAsync(r => r.Id == id && (isAdmin || r.UserId == userId));
        if (!canAccess)
        {
            return null;
        }

        return await _db.StatusHistories
            .AsNoTracking()
            .Where(h => h.ReportId == id)
            .OrderBy(h => h.ChangedAt)
            .ThenBy(h => h.Id)
            .Select(h => new StatusHistoryDto
            {
                Id = h.Id,
                FromStatus = h.FromStatus.ToString(),
                ToStatus = h.ToStatus.ToString(),
                ChangedAt = h.ChangedAt,
                ChangedByName = h.ChangedByUser.Name
            })
            .ToListAsync();
    }
}
