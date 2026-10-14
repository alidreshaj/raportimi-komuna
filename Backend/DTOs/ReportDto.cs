namespace Backend.DTOs;

// Çfarë kthen serveri për një raport. Nuk përmban objektin User (as PasswordHash, as email).
public class ReportDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    // Vetëm emri i raportuesit, që admini të di kush e ka dërguar.
    public string ReporterName { get; set; } = string.Empty;

    // Fotot e raportit (nga më e vjetra), me adresën ku shihet secila.
    public List<ImageDto> Images { get; set; } = new();
}
