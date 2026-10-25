namespace Backend.Models;

// Një kod i përkohshëm për rivendosjen e fjalëkalimit. Ruhet vetëm hash-i i tij (si fjalëkalimet): kush e shikon databazën
// nuk mund ta përdorë. Skadon pas pak minutash dhe përdoret vetëm një herë.
public class PasswordResetToken
{
    public int Id { get; set; }

    // SHA-256 i kodit (hex). Kodi i vërtetë shkon vetëm te përdoruesi, përmes lidhjes.
    public string TokenHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }

    // Kur u përdor; null = ende i papërdorur.
    public DateTime? UsedAt { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
