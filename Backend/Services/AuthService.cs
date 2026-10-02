using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher _passwordHasher;
    private readonly JwtService _jwtService;

    public AuthService(AppDbContext db, PasswordHasher passwordHasher, JwtService jwtService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
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

    // Hyrja në sistem. Kthen null nëse email-i ose password-i është i gabuar.
    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Njëjtë për "email nuk ekziston" dhe "password i gabuar", që të mos zbulojmë cilat email-e ekzistojnë.
        if (user is null || !_passwordHasher.Verify(dto.Password, user.PasswordHash))
        {
            return null;
        }

        var (token, expiresAt) = _jwtService.CreateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }
}
