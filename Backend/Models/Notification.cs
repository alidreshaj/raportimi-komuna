namespace Backend.Models;

// Një njoftim për një përdorues, që lidhet me një raport. Krijohet vetë kur ndodh diçka (statusi, koment, raport i ri).
public class Notification
{
    public int Id { get; set; }

    public NotificationType Type { get; set; }

    // Teksti që shfaqet, gati në shqip (p.sh. "Raporti yt u mor në trajtim.").
    public string Message { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Kur u lexua; null = ende i palexuar.
    public DateTime? ReadAt { get; set; }

    // Kujt i takon njoftimi (vetëm ai e sheh).
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Te cili raport çon njoftimi.
    public int ReportId { get; set; }
    public Report Report { get; set; } = null!;
}
