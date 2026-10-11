using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs;

// Çfarë dërgon admini për të ndryshuar statusin e një raporti.
public class UpdateStatusDto
{
    [Required]
    [EnumDataType(typeof(ReportStatus))]
    public ReportStatus? Status { get; set; }
}
