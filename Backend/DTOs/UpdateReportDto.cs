using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

// Çfarë dërgon qytetari për të ndryshuar përmbajtjen e raportit të vet.
// Statusi nuk ndryshohet këtu: ka endpoint-in e vet, vetëm për Admin.
public class UpdateReportDto
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

    [Range(-90, 90)]
    public double? Latitude { get; set; }

    [Range(-180, 180)]
    public double? Longitude { get; set; }
}
