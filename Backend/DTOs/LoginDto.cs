using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

// Çfarë dërgon klienti për të hyrë.
public class LoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
