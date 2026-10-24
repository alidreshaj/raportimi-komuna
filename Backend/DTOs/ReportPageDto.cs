namespace Backend.DTOs;

// Një faqe e listës së raporteve, plus informacioni që i duhet frontend-it për kontrollet.
public class ReportPageDto
{
    public List<ReportDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }

    // Sa raporte ka gjithsej me këto filtra (jo vetëm në këtë faqe).
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }

    // Sa raporte ka për secilin status sipas filtrave të tjerë (kërkimi, kategoria, datat), pa filtrin e statusit.
    // Gjithmonë të katër statuset, edhe me 0. Për çipat e statusit.
    public List<StatusCountDto> StatusCounts { get; set; } = new();
}
