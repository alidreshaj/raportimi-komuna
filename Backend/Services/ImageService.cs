using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public enum ImageUploadResult
{
    Success,
    NotFound,       // raporti nuk ekziston ose nuk është i këtij përdoruesi → 404
    NotEditable,    // statusi nuk është New → 409
    NoFiles,        // nuk u dërgua asnjë file → 400
    TooManyImages,  // do të kalonte 5 foto për raport → 400
    InvalidFile     // një file nuk kalon validimin → 400
}

public enum ImageDeleteResult
{
    Success,
    NotFound,    // fotoja nuk ekziston, ose raporti nuk është i këtij përdoruesi → 404
    NotEditable  // statusi i raportit nuk është New → 409
}

// Rezultati i ngarkimit: kodi, fotot e ngarkuara (nëse u krye), dhe mesazhi i gabimit (nëse dështoi).
public record ImageUploadOutcome(ImageUploadResult Result, List<ImageDto>? Images = null, string? Message = null);

// Një foto gati për t'u dërguar: rruga e plotë në disk dhe lloji i përmbajtjes.
public record ImageFile(string FullPath, string ContentType);

public class ImageService
{
    private readonly AppDbContext _db;
    private readonly ImageFileService _files;
    private readonly ILogger<ImageService> _logger;

    public ImageService(AppDbContext db, ImageFileService files, ILogger<ImageService> logger)
    {
        _db = db;
        _files = files;
        _logger = logger;
    }

    // Gjen një foto për ta dërguar. Admin sheh çdo foto, qytetari vetëm ato të raporteve të veta.
    // Kthen null nëse fotoja nuk gjendet, nuk është e lejuar, ose file mungon në disk (404).
    public async Task<ImageFile?> GetFileAsync(int userId, bool isAdmin, int reportId, int imageId)
    {
        var fileName = await _db.Images
            .AsNoTracking()
            .Where(i => i.Id == imageId
                        && i.ReportId == reportId
                        && (isAdmin || i.Report.UserId == userId))
            .Select(i => i.FilePath)
            .FirstOrDefaultAsync();

        if (fileName is null)
        {
            return null;
        }

        // Roja kontrollon që emri është i pastër dhe që file ekziston.
        var fullPath = _files.GetFullPath(fileName);
        if (fullPath is null)
        {
            return null;
        }

        // Lloji nxirret nga prapashtesa që e ruajtëm ne (e vërtetuar sipas përmbajtjes), jo nga klienti.
        var contentType = Path.GetExtension(fileName) == ".png" ? "image/png" : "image/jpeg";
        return new ImageFile(fullPath, contentType);
    }

    // Heq një foto të raportit të vet. Lejohet vetëm kur raporti është New.
    public async Task<ImageDeleteResult> DeleteAsync(int userId, int reportId, int imageId)
    {
        // Pronësia: fotoja duhet të jetë e këtij raporti, dhe raporti i këtij përdoruesi.
        var image = await _db.Images
            .Include(i => i.Report)
            .FirstOrDefaultAsync(i => i.Id == imageId && i.ReportId == reportId && i.Report.UserId == userId);

        if (image is null)
        {
            return ImageDeleteResult.NotFound;
        }

        if (image.Report.Status != ReportStatus.New)
        {
            return ImageDeleteResult.NotEditable;
        }

        var fileName = image.FilePath;

        // Databaza e para: nëse dështon, asgjë nuk ka ndryshuar.
        _db.Images.Remove(image);
        await _db.SaveChangesAsync();

        // Pastaj file-i nga disku. Nëse dështon, mbetet vetëm një file i tepërt (jetim): e regjistrojmë.
        try
        {
            _files.Delete(fileName);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Nuk u fshi file-i {FileName} i foto-s {ImageId}.", fileName, imageId);
        }

        return ImageDeleteResult.Success;
    }

    // Ngarkon foto te raporti i vet. Lejohet vetëm kur raporti është New.
    // Gjithçka ose asgjë: nëse një file është i pavlefshëm, nuk ruhet asnjë.
    public async Task<ImageUploadOutcome> UploadAsync(int userId, int reportId, IReadOnlyList<IFormFile> files)
    {
        // Pronësia: gjejmë vetëm raportin që është i këtij përdoruesi.
        var report = await _db.Reports
            .AsNoTracking()
            .Where(r => r.Id == reportId && r.UserId == userId)
            .Select(r => new { r.Status })
            .FirstOrDefaultAsync();

        if (report is null)
        {
            return new ImageUploadOutcome(ImageUploadResult.NotFound);
        }

        if (report.Status != ReportStatus.New)
        {
            return new ImageUploadOutcome(ImageUploadResult.NotEditable);
        }

        if (files.Count == 0)
        {
            return new ImageUploadOutcome(ImageUploadResult.NoFiles, Message: "Zgjidh të paktën një foto.");
        }

        var existing = await _db.Images.CountAsync(i => i.ReportId == reportId);
        if (existing + files.Count > ImageFileService.MaxImagesPerReport)
        {
            return new ImageUploadOutcome(ImageUploadResult.TooManyImages,
                Message: $"Raporti ka tashmë {existing} foto. Maksimumi është {ImageFileService.MaxImagesPerReport}.");
        }

        // Fillimisht validojmë të gjitha. Nuk ruajmë asgjë derisa të jenë të gjitha në rregull.
        var valid = new List<(IFormFile File, string Extension)>();
        foreach (var file in files)
        {
            var (result, extension) = await _files.ValidateAsync(file);
            if (result != ImageValidationResult.Ok)
            {
                var name = Path.GetFileName(file.FileName);
                var reason = result switch
                {
                    ImageValidationResult.EmptyFile => "file-i është bosh.",
                    ImageValidationResult.TooLarge => $"kalon madhësinë maksimale prej {ImageFileService.MaxFileSizeBytes / (1024 * 1024)} MB.",
                    _ => "lejohen vetëm foto JPG, JPEG ose PNG të vërteta."
                };
                return new ImageUploadOutcome(ImageUploadResult.InvalidFile, Message: $"'{name}': {reason}");
            }

            valid.Add((file, extension!));
        }

        // Ruajmë file-t në disk, pastaj rreshtat te databaza.
        var savedNames = new List<string>();
        var images = new List<Image>();
        try
        {
            foreach (var (file, extension) in valid)
            {
                savedNames.Add(await _files.SaveAsync(file, extension));
            }

            images = savedNames.Select(n => new Image { FilePath = n, ReportId = reportId }).ToList();
            _db.Images.AddRange(images);
            await _db.SaveChangesAsync();
        }
        catch
        {
            // Nëse dështoi diçka, fshijmë file-t që sapo i ruajtëm, që të mos mbeten jetimë.
            foreach (var name in savedNames)
            {
                _files.Delete(name);
            }

            throw;
        }

        var dtos = images.Select(i => new ImageDto
        {
            Id = i.Id,
            UploadedAt = i.UploadedAt,
            Url = $"/api/reports/{reportId}/images/{i.Id}"
        }).ToList();

        return new ImageUploadOutcome(ImageUploadResult.Success, dtos);
    }
}
