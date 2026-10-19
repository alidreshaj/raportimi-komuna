namespace Backend.Models;

// Një ndryshim statusi i një raporti: nga cili status në cilin, kush e bëri dhe kur.
// Çdo ndryshim ruhet si rresht i ri, kështu historia nuk humbet kur statusi mbishkruhet.
public class StatusHistory
{
    public int Id { get; set; }

    public ReportStatus FromStatus { get; set; }
    public ReportStatus ToStatus { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    // Te cili raport u bë ndryshimi.
    public int ReportId { get; set; }
    public Report Report { get; set; } = null!;

    // Kush e ndryshoi statusin (gjithmonë një Admin).
    public int ChangedByUserId { get; set; }
    public User ChangedByUser { get; set; } = null!;
}
