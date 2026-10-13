using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs;

// Çfarë dërgon admini për të ndryshuar statusin e një raporti.
public class UpdateStatusDto
{
    [Required]
    [EnumDataType(typeof(ReportStatus))]
    public ReportStatus? Status { get; set; }

    // Arsyeja, e detyrueshme kur Status = Rejected (kontrollohet te service-i).
    // Për statuset e tjera është opsionale. Ruhet si koment te raporti.
    [MaxLength(1000)]
    public string? Reason { get; set; }
}
