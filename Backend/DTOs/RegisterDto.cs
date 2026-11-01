using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

// Çfarë dërgon klienti për t'u regjistruar. Nuk ka Role: roli vendoset gjithmonë nga serveri.
public class RegisterDto
{
    [Required(ErrorMessage = "Emri është i detyrueshëm.")]
    [MaxLength(100, ErrorMessage = "Emri nuk mund të ketë më shumë se 100 karaktere.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email-i është i detyrueshëm.")]
    [EmailAddress(ErrorMessage = "Email-i nuk është i vlefshëm.")]
    [MaxLength(200, ErrorMessage = "Email-i nuk mund të ketë më shumë se 200 karaktere.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Fjalëkalimi është i detyrueshëm.")]
    [MinLength(8, ErrorMessage = "Fjalëkalimi duhet të ketë të paktën 8 karaktere.")]
    [MaxLength(100, ErrorMessage = "Fjalëkalimi nuk mund të ketë më shumë se 100 karaktere.")]
    public string Password { get; set; } = string.Empty;
}
