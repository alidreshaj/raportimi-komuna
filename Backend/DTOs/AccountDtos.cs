using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs;

// Ndryshimi i emrit të llogarisë sime.
public class UpdateProfileDto
{
    [Required(ErrorMessage = "Shkruaj emrin.")]
    [MaxLength(100, ErrorMessage = "Emri nuk mund të ketë më shumë se 100 karaktere.")]
    public string Name { get; set; } = string.Empty;
}

// Ndryshimi i fjalëkalimit kur je i loguar: duhet fjalëkalimi aktual (që të mos e ndryshojë dikush që gjen një sesion të hapur).
public class ChangePasswordDto
{
    [Required(ErrorMessage = "Shkruaj fjalëkalimin aktual.")]
    [MaxLength(100)]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Shkruaj fjalëkalimin e ri.")]
    [MinLength(8, ErrorMessage = "Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere.")]
    [MaxLength(100, ErrorMessage = "Fjalëkalimi nuk mund të ketë më shumë se 100 karaktere.")]
    public string NewPassword { get; set; } = string.Empty;
}

// "Harrova fjalëkalimin": email-i ku do të dërgohet lidhja.
public class ForgotPasswordDto
{
    [Required(ErrorMessage = "Shkruaj email-in.")]
    [EmailAddress(ErrorMessage = "Email-i nuk është i vlefshëm.")]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;
}

// Rivendosja me kodin nga lidhja.
public class ResetPasswordDto
{
    [Required(ErrorMessage = "Mungon kodi i rivendosjes.")]
    [MaxLength(200)]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "Shkruaj fjalëkalimin e ri.")]
    [MinLength(8, ErrorMessage = "Fjalëkalimi i ri duhet të ketë të paktën 8 karaktere.")]
    [MaxLength(100, ErrorMessage = "Fjalëkalimi nuk mund të ketë më shumë se 100 karaktere.")]
    public string NewPassword { get; set; } = string.Empty;
}
