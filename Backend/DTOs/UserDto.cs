namespace Backend.DTOs;

// Të dhënat publike të një përdoruesi. Nuk përmban kurrë PasswordHash.
public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
