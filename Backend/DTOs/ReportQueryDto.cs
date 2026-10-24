using System.ComponentModel.DataAnnotations;
using Backend.Models;

namespace Backend.DTOs;

// Parametrat e listës së raporteve (vijnë nga adresa): filtra, kërkim, radhitje dhe faqosje.
public class ReportQueryDto
{
    public ReportStatus? Status { get; set; }
    public int? CategoryId { get; set; }
    public DateOnly? From { get; set; }
    public DateOnly? To { get; set; }

    // Fjalët e kërkimit (me hapësira). Kërkon te titulli, përshkrimi, vendi, kategoria dhe (vetëm për Admin) emri i raportuesit.
    [MaxLength(100, ErrorMessage = "Kërkimi nuk mund të ketë më shumë se 100 karaktere.")]
    public string? Search { get; set; }

    // "newest" (paracaktuar), "oldest", "title" ose "status".
    [RegularExpression("^(newest|oldest|title|status)$", ErrorMessage = "Radhitja duhet të jetë newest, oldest, title ose status.")]
    public string Sort { get; set; } = "newest";

    [Range(1, 1_000_000, ErrorMessage = "Faqja duhet të jetë 1 ose më shumë.")]
    public int Page { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "Madhësia e faqes duhet të jetë mes 1 dhe 100.")]
    public int PageSize { get; set; } = 20;
}
