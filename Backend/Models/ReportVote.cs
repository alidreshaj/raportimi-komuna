namespace Backend.Models;

// Mbështetja e një qytetari për një raport ("edhe unë e kam këtë problem").
// Çelësi është (ReportId, UserId): i njëjti person nuk mund të votojë dy herë për të njëjtin raport.
public class ReportVote
{
    public int ReportId { get; set; }
    public Report Report { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
