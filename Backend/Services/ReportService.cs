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
}
