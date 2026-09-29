namespace Backend.Models;

public class Report
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Adresa ose përshkrimi i vendit.
    public string Location { get; set; } = string.Empty;

    // Opsionale, për hartë më vonë (null = nuk janë dhënë).
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public ReportStatus Status { get; set; } = ReportStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Kush e ka raportuar.
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Çfarë lloji problemi është.
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    // Një raport ka shumë foto dhe shumë komente.
    public List<Image> Images { get; set; } = new();
    public List<Comment> Comments { get; set; } = new();
}
