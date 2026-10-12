using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

// Çfarë dërgon përdoruesi për të shkruar koment.
// Nuk ka UserId dhe ReportId: i pari vjen nga tokeni, i dyti nga adresa.
public class CreateCommentDto
{
    [Required]
    [MaxLength(1000)]
    public string Text { get; set; } = string.Empty;
}
