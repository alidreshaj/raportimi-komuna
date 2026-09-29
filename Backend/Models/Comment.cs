namespace Backend.Models;

public class Comment
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Te cili raport është shkruar komenti.
    public int ReportId { get; set; }
    public Report Report { get; set; } = null!;

    // Kush e ka shkruar komentin (qytetar ose admin).
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
