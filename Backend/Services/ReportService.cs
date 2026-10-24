using System.Linq.Expressions;
using System.Text;
using System.Text.RegularExpressions;
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
        CommentCount = r.Comments.Count(),
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

    // Raportet e përdoruesit të loguar (një faqe), me kërkim, filtra dhe radhitje.
    public Task<ReportPageDto> GetMyAsync(int userId, ReportQueryDto q)
    {
        // Qytetari është raportuesi i vetëm këtu, prandaj kërkimi nuk shikon emrin e raportuesit.
        return BuildPageAsync(_db.Reports.AsNoTracking().Where(r => r.UserId == userId), q, includeReporter: false);
    }

    // Të gjitha raportet (për Admin), një faqe, me kërkim, filtra dhe radhitje.
    public Task<ReportPageDto> GetAllAsync(ReportQueryDto q)
    {
        return BuildPageAsync(_db.Reports.AsNoTracking(), q, includeReporter: true);
    }

    // Pikat për hartën e adminit: vetëm raportet me koordinata, me të njëjtat filtra, pa faqosje (harta i do të gjitha).
    public async Task<List<ReportPinDto>> GetPinsAsync(ReportQueryDto q)
    {
        var filtered = ApplyFilters(_db.Reports.AsNoTracking(), q, includeReporter: true);
        if (q.Status.HasValue)
        {
            filtered = filtered.Where(r => r.Status == q.Status.Value);
        }

        return await filtered
            .Where(r => r.Latitude != null && r.Longitude != null)
            .OrderByDescending(r => r.CreatedAt)
            .Take(MaxPins)
            .Select(r => new ReportPinDto
            {
                Id = r.Id,
                Title = r.Title,
                Location = r.Location,
                Status = r.Status.ToString(),
                CategoryName = r.Category.Name,
                CreatedAt = r.CreatedAt,
                Latitude = r.Latitude!.Value,
                Longitude = r.Longitude!.Value
            })
            .ToListAsync();
    }

    // Kufiri i sigurisë: harta nuk merr më shumë se kaq pika.
    private const int MaxPins = 5000;

    // Pas sa ditësh një raport i ri quhet "i vonuar" (për statistikat dhe kartën "Kërkon vëmendje").
    private const int LateAfterDays = 3;

    // Ndërton një faqe: numëron statuset (për çipat), aplikon filtrin e statusit, radhit dhe merr vetëm faqen e kërkuar.
    // Numërimi dhe faqosja bëhen nga databaza, kështu një listë me mijëra raporte mbetet e shpejtë.
    private async Task<ReportPageDto> BuildPageAsync(IQueryable<Report> source, ReportQueryDto q, bool includeReporter)
    {
        // Filtrat pa statusin: nga këta dalin numrat e çipave (që të tregojnë sa ka për secilin status).
        var filtered = ApplyFilters(source, q, includeReporter);

        var grouped = await filtered
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var statusCounts = Enum.GetValues<ReportStatus>()
            .Select(s => new StatusCountDto
            {
                Status = s.ToString(),
                Count = grouped.FirstOrDefault(x => x.Status == s)?.Count ?? 0
            })
            .ToList();

        // Totali i listës pas filtrit të statusit del nga numrat që kemi tashmë (pa një COUNT të dytë).
        var selected = q.Status.HasValue ? filtered.Where(r => r.Status == q.Status.Value) : filtered;
        var totalCount = q.Status.HasValue
            ? statusCounts.First(c => c.Status == q.Status.Value.ToString()).Count
            : statusCounts.Sum(c => c.Count);

        var items = await ApplySort(selected, q.Sort)
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .Select(ToDto)
            .ToListAsync();

        return new ReportPageDto
        {
            Items = items,
            Page = q.Page,
            PageSize = q.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)q.PageSize),
            StatusCounts = statusCounts
        };
    }

    // Filtrat që nuk lidhen me statusin: kategoria, datat dhe kërkimi.
    private static IQueryable<Report> ApplyFilters(IQueryable<Report> query, ReportQueryDto q, bool includeReporter)
    {
        if (q.CategoryId.HasValue)
        {
            query = query.Where(r => r.CategoryId == q.CategoryId.Value);
        }

        if (q.From.HasValue)
        {
            var start = q.From.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(r => r.CreatedAt >= start);
        }

        if (q.To.HasValue)
        {
            // "to" përfshin gjithë ditën, prandaj marrim fillimin e ditës tjetër.
            var endExclusive = q.To.Value.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            query = query.Where(r => r.CreatedAt < endExclusive);
        }

        return ApplySearch(query, q.Search, includeReporter);
    }

    // Kërkimi: çdo fjalë duhet të gjendet diku (titulli, përshkrimi, vendi, kategoria, ose emri i raportuesit për Admin).
    // E bëjmë me shprehje të rregullt te PostgreSQL (~*), që "peje" të gjejë edhe "Pejë" pa u ndryshuar databaza (pa shtesën unaccent).
    private static IQueryable<Report> ApplySearch(IQueryable<Report> query, string? search, bool includeReporter)
    {
        var terms = (search ?? string.Empty).Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var term in terms.Take(5))
        {
            var pattern = SearchPattern(term);

            query = includeReporter
                ? query.Where(r =>
                    Regex.IsMatch(r.Title, pattern, RegexOptions.IgnoreCase) ||
                    Regex.IsMatch(r.Description, pattern, RegexOptions.IgnoreCase) ||
                    Regex.IsMatch(r.Location, pattern, RegexOptions.IgnoreCase) ||
                    Regex.IsMatch(r.Category.Name, pattern, RegexOptions.IgnoreCase) ||
                    Regex.IsMatch(r.User.Name, pattern, RegexOptions.IgnoreCase))
                : query.Where(r =>
                    Regex.IsMatch(r.Title, pattern, RegexOptions.IgnoreCase) ||
                    Regex.IsMatch(r.Description, pattern, RegexOptions.IgnoreCase) ||
                    Regex.IsMatch(r.Location, pattern, RegexOptions.IgnoreCase) ||
                    Regex.IsMatch(r.Category.Name, pattern, RegexOptions.IgnoreCase));
        }

        return query;
    }

    // Kthen një fjalë kërkimi në shprehje të rregullt: e/ë dhe c/ç quhen të njëjta, çdo karakter tjetër merret fjalë për fjalë.
    // Shkronjat e mëdha shqipe i japim ne, sepse rregulli i madhësisë së shkronjave varet nga cilësimet e databazës.
    private static string SearchPattern(string term)
    {
        var sb = new StringBuilder();
        foreach (var ch in term)
        {
            sb.Append(ch switch
            {
                'e' or 'E' or 'ë' or 'Ë' => "[eEëË]",
                'c' or 'C' or 'ç' or 'Ç' => "[cCçÇ]",
                _ => Regex.Escape(ch.ToString())
            });
        }
        return sb.ToString();
    }

    // Radhitja e kërkuar. Statusi radhitet sipas rrjedhës (E re, Në trajtim, U zgjidh, Refuzuar), jo sipas alfabetit.
    private static IQueryable<Report> ApplySort(IQueryable<Report> query, string sort)
    {
        return sort switch
        {
            "oldest" => query.OrderBy(r => r.CreatedAt).ThenBy(r => r.Id),
            "title" => query.OrderBy(r => r.Title).ThenBy(r => r.Id),
            "status" => query
                .OrderBy(r => r.Status == ReportStatus.New ? 0 : r.Status == ReportStatus.InProgress ? 1 : r.Status == ReportStatus.Resolved ? 2 : 3)
                .ThenByDescending(r => r.CreatedAt)
                .ThenBy(r => r.Id),
            _ => query.OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id)
        };
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

    // Përmbledhja për komunën: sa raporte ka gjithsej, sipas statusit, sipas kategorisë dhe sipas muajit.
    // Numërimi bëhet nga databaza (GroupBy), kështu nuk shkarkojmë raportet vetëm për t'i numëruar.
    public async Task<StatsDto> GetStatsAsync()
    {
        var statusCounts = await _db.Reports
            .AsNoTracking()
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        // Të katër statuset gjithmonë, edhe ato që nuk kanë asnjë raport.
        var byStatus = Enum.GetValues<ReportStatus>()
            .Select(s => new StatusCountDto
            {
                Status = s.ToString(),
                Count = statusCounts.FirstOrDefault(x => x.Status == s)?.Count ?? 0
            })
            .ToList();

        // Të gjitha kategoritë (edhe me 0 raporte), nga më e ngarkuara.
        var byCategory = await _db.Categories
            .AsNoTracking()
            .OrderByDescending(c => c.Reports.Count())
            .ThenBy(c => c.Name)
            .Select(c => new CategoryCountDto
            {
                CategoryId = c.Id,
                CategoryName = c.Name,
                Count = c.Reports.Count()
            })
            .ToListAsync();

        // 6 muajt e fundit: nga dita e parë e muajit që është 5 muaj më parë, deri te muaji aktual.
        var now = DateTime.UtcNow;
        var firstMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-5);

        var monthCounts = await _db.Reports
            .AsNoTracking()
            .Where(r => r.CreatedAt >= firstMonth)
            .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();

        // Muajt pa raporte shfaqen me 0, që vija e grafikut të mos ketë boshllëqe.
        var byMonth = Enumerable.Range(0, 6)
            .Select(i => firstMonth.AddMonths(i))
            .Select(m => new MonthCountDto
            {
                Year = m.Year,
                Month = m.Month,
                Count = monthCounts.FirstOrDefault(x => x.Year == m.Year && x.Month == m.Month)?.Count ?? 0
            })
            .ToList();

        var lateCutoff = DateTime.UtcNow.AddDays(-LateAfterDays);
        var lateNew = await _db.Reports.CountAsync(r => r.Status == ReportStatus.New && r.CreatedAt <= lateCutoff);

        return new StatsDto
        {
            Total = byStatus.Sum(s => s.Count),
            LateNew = lateNew,
            ByStatus = byStatus,
            ByCategory = byCategory,
            ByMonth = byMonth
        };
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
