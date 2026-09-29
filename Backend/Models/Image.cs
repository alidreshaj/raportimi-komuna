namespace Backend.Models;

public class Image
{
    public int Id { get; set; }

    // Fotoja ruhet si file në uploads/, në databazë vetëm rruga e saj.
    public string FilePath { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public int ReportId { get; set; }
    public Report Report { get; set; } = null!;
}
