using System.Security.Cryptography;
using System.Text;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly PasswordHasher _passwordHasher;
    private readonly JwtService _jwtService;
    private readonly IResetLinkSender _resetLinkSender;
    private readonly IConfiguration _config;

    // Sa minuta vlen lidhja e rivendosjes, dhe sa pret serveri para se të krijojë një kod të ri për të njëjtin përdorues.
    private const int ResetValidMinutes = 30;
    private const int ResetCooldownSeconds = 60;

    public AuthService(
        AppDbContext db,
        PasswordHasher passwordHasher,
        JwtService jwtService,
        IResetLinkSender resetLinkSender,
        IConfiguration config)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _resetLinkSender = resetLinkSender;
        _config = config;
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

        return BuildAuthResponse(user);
    }

    // Ndryshon emrin e llogarisë. Kthen një token të ri: emri është brenda tokenit, kështu i vjetri do ta mbante emrin e vjetër.
    public async Task<AuthResponseDto?> UpdateProfileAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return null;
        }

        user.Name = dto.Name.Trim();
        await _db.SaveChangesAsync();

        return BuildAuthResponse(user);
    }

    public enum ChangePasswordResult
    {
        Success,
        WrongCurrentPassword,
        SameAsCurrent,
        NotFound
    }

    // Ndryshon fjalëkalimin e përdoruesit të loguar. Kërkon fjalëkalimin aktual.
    public async Task<ChangePasswordResult> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return ChangePasswordResult.NotFound;
        }

        if (!_passwordHasher.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            return ChangePasswordResult.WrongCurrentPassword;
        }

        if (dto.CurrentPassword == dto.NewPassword)
        {
            return ChangePasswordResult.SameAsCurrent;
        }

        user.PasswordHash = _passwordHasher.Hash(dto.NewPassword);
        await _db.SaveChangesAsync();

        return ChangePasswordResult.Success;
    }

    // "Harrova fjalëkalimin": krijon një kod të përkohshëm dhe e dërgon lidhjen. Nuk tregon kurrë nëse email-i ekziston
    // (përgjigjja e jashtme është gjithmonë e njëjtë), që askush të mos zbulojë cilat email-e janë të regjistruara.
    public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null)
        {
            return;
        }

        // Mbrojtje e thjeshtë nga shpërdorimi: jo më shumë se një lidhje në minutë për të njëjtin përdorues.
        var recent = DateTime.UtcNow.AddSeconds(-ResetCooldownSeconds);
        if (await _db.PasswordResetTokens.AnyAsync(t => t.UserId == user.Id && t.CreatedAt > recent))
        {
            return;
        }

        // Kodet e vjetra të papërdorura humbasin vlerën: vlen vetëm i fundit.
        var old = await _db.PasswordResetTokens.Where(t => t.UserId == user.Id && t.UsedAt == null).ToListAsync();
        _db.PasswordResetTokens.RemoveRange(old);

        var token = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = HashToken(token),
            ExpiresAt = DateTime.UtcNow.AddMinutes(ResetValidMinutes)
        });
        await _db.SaveChangesAsync();

        var baseUrl = (_config["App:FrontendUrl"] ?? "http://localhost:5173").TrimEnd('/');
        await _resetLinkSender.SendAsync(user.Email, user.Name, $"{baseUrl}/rivendos-fjalekalimin?token={token}");
    }

    // Vendos fjalëkalimin e ri me kodin nga lidhja. Kthen false nëse kodi është i gabuar, i skaduar ose i përdorur.
    public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var hash = HashToken(dto.Token.Trim());
        var now = DateTime.UtcNow;

        var record = await _db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == hash && t.UsedAt == null && t.ExpiresAt > now);
        if (record is null)
        {
            return false;
        }

        record.User.PasswordHash = _passwordHasher.Hash(dto.NewPassword);
        record.UsedAt = now; // përdoret vetëm një herë

        await _db.SaveChangesAsync();
        return true;
    }

    private static string HashToken(string token)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
    }

    private AuthResponseDto BuildAuthResponse(User user)
    {
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
