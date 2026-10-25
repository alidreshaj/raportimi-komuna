namespace Backend.DTOs;

// Çfarë kthen serveri për një njoftim.
public class NotificationDto
{
    public int Id { get; set; }

    // "StatusChanged", "NewComment" ose "NewReport".
    public string Type { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;
    public int ReportId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}

// Lista e njoftimeve të përdoruesit (më të rejat të parat), plus sa janë të palexuara gjithsej.
public class NotificationListDto
{
    public List<NotificationDto> Items { get; set; } = new();
    public int UnreadCount { get; set; }
}
