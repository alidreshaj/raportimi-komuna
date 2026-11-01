using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

// Çfarë dërgon përdoruesi për të shkruar koment.
// Nuk ka UserId dhe ReportId: i pari vjen nga tokeni, i dyti nga adresa.
public class CreateCommentDto
{
    [Required(ErrorMessage = "Teksti është i detyrueshëm.")]
    [MaxLength(1000, ErrorMessage = "Teksti nuk mund të ketë më shumë se 1000 karaktere.")]
    public string Text { get; set; } = string.Empty;
}
