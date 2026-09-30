using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

// Çfarë dërgon klienti për t'u regjistruar. Nuk ka Role: roli vendoset gjithmonë nga serveri.
public class RegisterDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}
