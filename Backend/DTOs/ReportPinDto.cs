namespace Backend.DTOs;

// Çfarë i duhet hartës për një raport: vetëm pika dhe të dhënat e kartës së shenjës, pa përshkrim dhe foto (shumë më i lehtë se ReportDto).
public class ReportPinDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}
