using System.Linq.Expressions;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class ReportService
{
    private readonly AppDbContext _db;

    public ReportService(AppDbContext db)
    {
        _db = db;
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
        ReporterName = r.User.Name
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
}
