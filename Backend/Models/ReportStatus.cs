namespace Backend.Models;

// Statuset e një raporti: New → InProgress → Resolved, ose New → Rejected.
public enum ReportStatus
{
    New,
    InProgress,
    Resolved,
    Rejected
}
