using Backend.Models;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

// Krijon të dhënat fillestare që duhen që nga nisja (tani: admin-in).
public static class DbSeeder
{
    public static async Task SeedAdminAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<PasswordHasher>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        // Nëse ka tashmë një admin, nuk bëjmë asgjë.
        if (await db.Users.AnyAsync(u => u.Role == Role.Admin))
        {
            return;
        }

        // Email-i dhe password-i i adminit vijnë nga user-secrets, jo nga kodi.
        var email = config["Admin:Email"]?.Trim().ToLowerInvariant();
        var password = config["Admin:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning("Nuk u krijua admin: mungojnë Admin:Email dhe Admin:Password te user-secrets.");
            return;
        }

        if (await db.Users.AnyAsync(u => u.Email == email))
        {
            logger.LogWarning("Nuk u krijua admin: email-i i adminit ekziston tashmë si përdorues tjetër.");
            return;
        }

        db.Users.Add(new User
        {
            Name = config["Admin:Name"] ?? "Administrator",
            Email = email,
            PasswordHash = hasher.Hash(password),
            Role = Role.Admin
        });

        await db.SaveChangesAsync();
        logger.LogInformation("Admin-i u krijua.");
    }

    // Kategoritë fillestare (nga docs/plani.md).
    private static readonly string[] DefaultCategories =
    [
        "Rrugë", "Ndriçim", "Mbeturina", "Ujë", "Kanalizim", "Hapësira publike", "Të tjera"
    ];

    // Shton vetëm kategoritë që mungojnë, kështu mund të ekzekutohet sa herë të duash.
    public static async Task SeedCategoriesAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DbSeeder");

        var existing = await db.Categories.Select(c => c.Name).ToListAsync();

        var missing = DefaultCategories
            .Where(name => !existing.Contains(name))
            .Select(name => new Category { Name = name })
            .ToList();

        if (missing.Count == 0)
        {
            return;
        }

        db.Categories.AddRange(missing);
        await db.SaveChangesAsync();
        logger.LogInformation("U shtuan {Count} kategori.", missing.Count);
    }
}
