using System.Security.Claims;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Backend.Tests;

// Anulimi i tokenëve të vjetër pas ndryshimit ose rivendosjes së fjalëkalimit.
public class SessionTests
{
    private sealed class CapturingSender : IResetLinkSender
    {
        public string? Link { get; private set; }

        public Task SendAsync(string email, string name, string link)
        {
            Link = link;
            return Task.CompletedTask;
        }
    }

    private static (AuthService Auth, SessionValidator Validator, AppDbContext Db, CapturingSender Sender) Create()
    {
        var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = new string('k', 40),
            ["Jwt:Issuer"] = "test",
            ["Jwt:Audience"] = "test",
            ["Jwt:ExpiryMinutes"] = "60"
        }).Build();

        var hasher = new PasswordHasher();
        db.Users.Add(new User { Id = 1, Name = "Ali", Email = "ali@test.local", PasswordHash = hasher.Hash("Fjalekalim1") });
        db.SaveChanges();

        var sender = new CapturingSender();
        var auth = new AuthService(db, hasher, new JwtService(config), sender, config);
        return (auth, new SessionValidator(db), db, sender);
    }

    private static ClaimsPrincipal Principal(int id, string? version)
    {
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, id.ToString()) };
        if (version is not null)
        {
            claims.Add(new Claim(SessionValidator.VersionClaim, version));
        }
        return new ClaimsPrincipal(new ClaimsIdentity(claims, "test"));
    }

    [Fact]
    public async Task TokeniINdarjes_Pranohet()
    {
        var (_, validator, _, _) = Create();

        Assert.True(await validator.IsCurrentAsync(Principal(1, "0")));
    }

    [Fact]
    public async Task TokeniPaVersion_ApoIPerdoruesitQeNukEkziston_Refuzohet()
    {
        var (_, validator, _, _) = Create();

        Assert.False(await validator.IsCurrentAsync(Principal(1, null)));
        Assert.False(await validator.IsCurrentAsync(Principal(99, "0")));
    }

    [Fact]
    public async Task NdryshimiIFjalekalimit_MbyllTokeninEVjeter_DheJepNjeTeRi()
    {
        var (auth, validator, db, _) = Create();

        var (result, response) = await auth.ChangePasswordAsync(1, new ChangePasswordDto
        {
            CurrentPassword = "Fjalekalim1",
            NewPassword = "FjalekalimIRi2"
        });

        Assert.Equal(AuthService.ChangePasswordResult.Success, result);
        Assert.NotNull(response);
        Assert.Equal(1, db.Users.Single().TokenVersion);
        Assert.False(await validator.IsCurrentAsync(Principal(1, "0")));
        Assert.True(await validator.IsCurrentAsync(Principal(1, "1")));
    }

    [Fact]
    public async Task FjalekalimiAktualIGabuar_NukNdryshonVersionin()
    {
        var (auth, _, db, _) = Create();

        var (result, response) = await auth.ChangePasswordAsync(1, new ChangePasswordDto
        {
            CurrentPassword = "gabim",
            NewPassword = "FjalekalimIRi2"
        });

        Assert.Equal(AuthService.ChangePasswordResult.WrongCurrentPassword, result);
        Assert.Null(response);
        Assert.Equal(0, db.Users.Single().TokenVersion);
    }

    [Fact]
    public async Task RivendosjaEFjalekalimit_MbyllTokeninEVjeter()
    {
        var (auth, validator, db, sender) = Create();
        await auth.ForgotPasswordAsync(new ForgotPasswordDto { Email = "ali@test.local" });
        Assert.NotNull(sender.Link);
        var token = sender.Link[(sender.Link.IndexOf("token=", StringComparison.Ordinal) + 6)..];

        var ok = await auth.ResetPasswordAsync(new ResetPasswordDto { Token = token, NewPassword = "FjalekalimIRi2" });

        Assert.True(ok);
        Assert.Equal(1, db.Users.Single().TokenVersion);
        Assert.False(await validator.IsCurrentAsync(Principal(1, "0")));
    }
}
