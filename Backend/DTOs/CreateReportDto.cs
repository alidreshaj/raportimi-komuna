using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

// Çfarë dërgon qytetari për të krijuar raport.
// Nuk ka UserId, Status ose data: i vendos serveri.
public class CreateReportDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string Location { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }

    // Opsionale, për hartë më vonë.
    [Range(-90, 90)]
    public double? Latitude { get; set; }

    [Range(-180, 180)]
    public double? Longitude { get; set; }
}
