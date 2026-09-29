namespace Backend.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Fjalëkalimi ruhet vetëm i hash-uar, kurrë si tekst i thjeshtë.
    public string PasswordHash { get; set; } = string.Empty;

    public Role Role { get; set; } = Role.Citizen;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Një përdorues ka shumë raporte dhe shumë komente.
    public List<Report> Reports { get; set; } = new();
    public List<Comment> Comments { get; set; } = new();
}
