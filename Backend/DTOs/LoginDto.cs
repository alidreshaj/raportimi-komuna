using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

// Çfarë dërgon klienti për të hyrë.
public class LoginDto
{
    [Required(ErrorMessage = "Email-i është i detyrueshëm.")]
    [EmailAddress(ErrorMessage = "Email-i nuk është i vlefshëm.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Fjalëkalimi është i detyrueshëm.")]
    public string Password { get; set; } = string.Empty;
}
