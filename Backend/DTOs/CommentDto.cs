namespace Backend.DTOs;

// Çfarë kthen serveri për një koment. Nuk përmban email, UserId ose PasswordHash.
public class CommentDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public string AuthorName { get; set; } = string.Empty;

    // "Admin" ose "Citizen", që frontend-i të dallojë komunën nga qytetari.
    public string AuthorRole { get; set; } = string.Empty;
}
