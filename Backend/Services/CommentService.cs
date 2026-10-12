using System.Linq.Expressions;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class CommentService
{
    private readonly AppDbContext _db;

    public CommentService(AppDbContext db)
    {
        _db = db;
    }

    // Si kthehet një Comment në CommentDto (pa email, pa UserId).
    private static readonly Expression<Func<Comment, CommentDto>> ToDto = c => new CommentDto
    {
        Id = c.Id,
        Text = c.Text,
        CreatedAt = c.CreatedAt,
        AuthorName = c.User.Name,
        AuthorRole = c.User.Role.ToString()
    };

    // Raporti duhet të jetë i dukshëm për përdoruesin: Admin sheh çdo raport, qytetari vetëm të vetët.
    private Task<bool> CanAccessReportAsync(int userId, bool isAdmin, int reportId)
    {
        return _db.Reports.AnyAsync(r => r.Id == reportId && (isAdmin || r.UserId == userId));
    }

    // Komentet e një raporti, nga më i vjetri te më i riu. Kthen null nëse raporti nuk lejohet (404).
    public async Task<List<CommentDto>?> GetAsync(int userId, bool isAdmin, int reportId)
    {
        if (!await CanAccessReportAsync(userId, isAdmin, reportId))
        {
            return null;
        }

        return await _db.Comments
            .AsNoTracking()
            .Where(c => c.ReportId == reportId)
            .OrderBy(c => c.CreatedAt)
            .ThenBy(c => c.Id)
            .Select(ToDto)
            .ToListAsync();
    }

    // Shton koment te raporti. Kthen null nëse raporti nuk lejohet (404).
    // Lejohet edhe kur raporti është i mbyllur.
    public async Task<CommentDto?> CreateAsync(int userId, bool isAdmin, int reportId, CreateCommentDto dto)
    {
        if (!await CanAccessReportAsync(userId, isAdmin, reportId))
        {
            return null;
        }

        var comment = new Comment
        {
            Text = dto.Text.Trim(),
            ReportId = reportId, // nga adresa
            UserId = userId      // nga tokeni
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        return await _db.Comments
            .AsNoTracking()
            .Where(c => c.Id == comment.Id)
            .Select(ToDto)
            .FirstAsync();
    }
}
