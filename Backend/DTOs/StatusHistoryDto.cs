namespace Backend.DTOs;

// Çfarë kthen serveri për një ndryshim statusi. Nuk përmban email ose UserId të adminit, vetëm emrin.
public class StatusHistoryDto
{
    public int Id { get; set; }

    // "New", "InProgress", "Resolved" ose "Rejected".
    public string FromStatus { get; set; } = string.Empty;
    public string ToStatus { get; set; } = string.Empty;

    public DateTime ChangedAt { get; set; }

    public string ChangedByName { get; set; } = string.Empty;
}
