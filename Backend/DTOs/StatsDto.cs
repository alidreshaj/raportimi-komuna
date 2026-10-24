namespace Backend.DTOs;

// Përmbledhja për komunën (vetëm Admin): vetëm numra, asnjë raport i plotë ose e dhënë personale.
public class StatsDto
{
    // Të gjitha raportet.
    public int Total { get; set; }

    // Sa raporte të reja (New) presin më shumë se 3 ditë. Për kartën "Kërkon vëmendje" te admini.
    public int LateNew { get; set; }

    // Gjithmonë të katër statuset, edhe me 0, që frontend-i të mos plotësojë asgjë vetë.
    public List<StatusCountDto> ByStatus { get; set; } = new();

    // Të gjitha kategoritë, edhe me 0, nga më e ngarkuara.
    public List<CategoryCountDto> ByCategory { get; set; } = new();

    // 6 muajt e fundit (përfshirë muajin aktual), nga më i vjetri, edhe muajt me 0.
    public List<MonthCountDto> ByMonth { get; set; } = new();
}

public class StatusCountDto
{
    // "New", "InProgress", "Resolved" ose "Rejected".
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class CategoryCountDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class MonthCountDto
{
    public int Year { get; set; }

    // 1-12. Muajt llogariten sipas UTC, njësoj si datat e tjera.
    public int Month { get; set; }
    public int Count { get; set; }
}
