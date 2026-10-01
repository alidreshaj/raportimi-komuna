using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher _passwordHasher;

    public AuthService(AppDbContext db, PasswordHasher passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    // Regjistron një qytetar të ri. Kthen null nëse email-i ekziston tashmë.
    public async Task<UserDto?> RegisterAsync(RegisterDto dto)
    {
        // Email-i normalizohet, që Ali@x.com dhe ali@x.com të jenë i njëjti.
        var email = dto.Email.Trim().ToLowerInvariant();

        var emailExists = await _db.Users.AnyAsync(u => u.Email == email);
        if (emailExists)
        {
            return null;
        }

        var user = new User
        {
            Name = dto.Name.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            Role = Role.Citizen // regjistrimi publik jep gjithmonë Citizen
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }
}
