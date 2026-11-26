using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Backend.Tests;

// "Harrove fjalëkalimin?": lidhja dërgohet vetëm për llogari që ekzistojnë, vlen një herë, skadon,
// dhe kodi i ri e zhvlerëson të vjetrin. Te databaza ruhet vetëm hash-i i kodit.
public class PasswordResetTests
{
    private const string Email = "ali@test.local";

    private sealed class CapturingSender : IResetLinkSender
    {
        public List<string> Links { get; } = [];

        public Task SendAsync(string email, string name, string link)
        {
            Links.Add(link);
            return Task.CompletedTask;
        }

        public string LastToken => Links[^1][(Links[^1].IndexOf("token=", StringComparison.Ordinal) + 6)..];
    }

    private static (AuthService Auth, AppDbContext Db, CapturingSender Sender) Create()
    {
        var db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = new string('k', 40),
            ["Jwt:Issuer"] = "test",
            ["Jwt:Audience"] = "test",
            ["Jwt:ExpiryMinutes"] = "60",
            ["App:FrontendUrl"] = "http://localhost:5173/"
        }).Build();

        var hasher = new PasswordHasher();
        db.Users.Add(new User { Id = 1, Name = "Ali", Email = Email, PasswordHash = hasher.Hash("Fjalekalim1") });
        db.SaveChanges();

        var sender = new CapturingSender();
        return (new AuthService(db, hasher, new JwtService(config), sender, config), db, sender);
    }

    private static Task Forgot(AuthService auth, string email = Email) =>
        auth.ForgotPasswordAsync(new ForgotPasswordDto { Email = email });

    private static Task<bool> Reset(AuthService auth, string token, string password = "FjalekalimIRi2") =>
        auth.ResetPasswordAsync(new ResetPasswordDto { Token = token, NewPassword = password });

    [Fact]
    public async Task EmailQeNukEkziston_NukDergonAsgje()
    {
        var (auth, db, sender) = Create();

        await Forgot(auth, "askush@test.local");

        Assert.Empty(sender.Links);
        Assert.Empty(db.PasswordResetTokens);
    }

    [Fact]
    public async Task Lidhja_ShkonTeFrontendi_DheDatabazaRuanVetemHashin()
    {
        var (auth, db, sender) = Create();

        await Forgot(auth, "  ALI@test.local ");

        var link = Assert.Single(sender.Links);
        Assert.StartsWith("http://localhost:5173/rivendos-fjalekalimin?token=", link);
        var stored = Assert.Single(db.PasswordResetTokens);
        Assert.NotEqual(sender.LastToken, stored.TokenHash);
        Assert.DoesNotContain(sender.LastToken, stored.TokenHash);
    }

    [Fact]
    public async Task Kodi_VlenVetemNjeHere_DheFjalekalimiIRiFunksionon()
    {
        var (auth, _, sender) = Create();
        await Forgot(auth);

        Assert.True(await Reset(auth, sender.LastToken));
        Assert.False(await Reset(auth, sender.LastToken, "TjetërFjalekalim3"));

        Assert.Null(await auth.LoginAsync(new LoginDto { Email = Email, Password = "Fjalekalim1" }));
        Assert.NotNull(await auth.LoginAsync(new LoginDto { Email = Email, Password = "FjalekalimIRi2" }));
    }

    [Fact]
    public async Task KodiISkaduar_ApoIGabuar_Refuzohet()
    {
        var (auth, db, sender) = Create();
        await Forgot(auth);
        db.PasswordResetTokens.Single().ExpiresAt = DateTime.UtcNow.AddSeconds(-1);
        await db.SaveChangesAsync();

        Assert.False(await Reset(auth, sender.LastToken));
        Assert.False(await Reset(auth, "kod-i-sajuar"));
        Assert.NotNull(await auth.LoginAsync(new LoginDto { Email = Email, Password = "Fjalekalim1" }));
    }

    [Fact]
    public async Task KerkesaEDyteBrendaNjeMinute_NukDergonLidhjeTeRe()
    {
        var (auth, db, sender) = Create();

        await Forgot(auth);
        await Forgot(auth);

        Assert.Single(sender.Links);
        Assert.Single(db.PasswordResetTokens);
    }

    [Fact]
    public async Task KodiIRi_EZhvleresonTeVjetrin()
    {
        var (auth, db, sender) = Create();
        await Forgot(auth);
        var oldToken = sender.LastToken;

        // Kalon minuta e pritjes: kodi i parë shtyhet në të shkuarën.
        db.PasswordResetTokens.Single().CreatedAt = DateTime.UtcNow.AddMinutes(-2);
        await db.SaveChangesAsync();
        await Forgot(auth);

        Assert.Equal(2, sender.Links.Count);
        Assert.False(await Reset(auth, oldToken));
        Assert.True(await Reset(auth, sender.LastToken));
    }
}
