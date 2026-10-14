namespace Backend.DTOs;

// Çfarë kthen serveri për një foto. Nuk përmban FilePath (emri i brendshëm në disk).
public class ImageDto
{
    public int Id { get; set; }
    public DateTime UploadedAt { get; set; }

    // Adresa ku shihet fotoja, p.sh. /api/reports/5/images/12
    public string Url { get; set; } = string.Empty;
}
