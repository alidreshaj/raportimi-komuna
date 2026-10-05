namespace Backend.DTOs;

// Çfarë shohin klientët për një kategori. Nuk përmban Reports.
public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
