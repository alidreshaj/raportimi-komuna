using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

// Çfarë dërgon qytetari për të ndryshuar përmbajtjen e raportit të vet.
// Statusi nuk ndryshohet këtu: ka endpoint-in e vet, vetëm për Admin.
public class UpdateReportDto
{
    [Required(ErrorMessage = "Titulli është i detyrueshëm.")]
    [MaxLength(200, ErrorMessage = "Titulli nuk mund të ketë më shumë se 200 karaktere.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Përshkrimi është i detyrueshëm.")]
    [MaxLength(2000, ErrorMessage = "Përshkrimi nuk mund të ketë më shumë se 2000 karaktere.")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vendndodhja është e detyrueshme.")]
    [MaxLength(300, ErrorMessage = "Vendndodhja nuk mund të ketë më shumë se 300 karaktere.")]
    public string Location { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Zgjidh një kategori të vlefshme.")]
    public int CategoryId { get; set; }

    [Range(-90, 90, ErrorMessage = "Gjerësia gjeografike duhet të jetë mes -90 dhe 90.")]
    public double? Latitude { get; set; }

    [Range(-180, 180, ErrorMessage = "Gjatësia gjeografike duhet të jetë mes -180 dhe 180.")]
    public double? Longitude { get; set; }
}
