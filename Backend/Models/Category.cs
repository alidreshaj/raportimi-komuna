namespace Backend.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Një kategori ka shumë raporte (lidhja 1 ── N).
    public List<Report> Reports { get; set; } = new();
}
