using Backend.Data;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace Backend.Tests;

// Nis API-n e vërtetë (me të gjithë pipeline-in: autentikim, role, validim) mbi një databazë në memorie.
public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();

    // Fotot e testeve shkojnë te një folder i përkohshëm, jo te Backend/uploads.
    public string UploadsPath { get; } = Path.Combine(Path.GetTempPath(), "komuna-tests-" + Guid.NewGuid().ToString("N"));

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("Jwt:Key", new string('k', 40));
        builder.UseSetting("Uploads:Path", UploadsPath);
        builder.UseSetting("ConnectionStrings:DefaultConnection", "Host=unused");

        builder.ConfigureServices(services =>
        {
            // Zëvendësojmë PostgreSQL me databazë në memorie.
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase(_dbName));

            // Pastrimi i përditshëm përdor ExecuteDelete, që databaza në memorie nuk e mbështet.
            services.RemoveAll<IHostedService>();
        });
    }

    // Krijon një përdorues direkt te databaza (pa kaluar nga hyrja, që ka kufizim kërkesash) dhe kthen tokenin e tij.
    public (int Id, string Token) CreateUser(string name, Role role = Role.Citizen)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var user = new User
        {
            Name = name,
            Email = $"{name.ToLowerInvariant()}@test.local",
            PasswordHash = "x",
            Role = role
        };
        db.Users.Add(user);
        db.SaveChanges();

        var (token, _) = scope.ServiceProvider.GetRequiredService<JwtService>().CreateToken(user);
        return (user.Id, token);
    }

    public int CreateReport(int userId, ReportStatus status = ReportStatus.New)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (!db.Categories.Any())
        {
            db.Categories.Add(new Category { Id = 1, Name = "Rrugë" });
        }

        var report = new Report
        {
            Title = "Gropë në rrugë",
            Description = "Gropë e madhe",
            Location = "Rruga A",
            UserId = userId,
            CategoryId = 1,
            Status = status
        };
        db.Reports.Add(report);
        db.SaveChanges();
        return report.Id;
    }

    // Krijon një foto të vërtetë (file + rresht te databaza) për një raport. Kthen id-në e foto-s.
    public int CreateImage(int reportId)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        Directory.CreateDirectory(UploadsPath);
        var fileName = Guid.NewGuid().ToString("N") + ".png";
        // Titulli i një PNG (8 bajtet e para); mjafton që të ketë përmbajtje.
        File.WriteAllBytes(Path.Combine(UploadsPath, fileName), [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

        var image = new Image { ReportId = reportId, FilePath = fileName };
        db.Images.Add(image);
        db.SaveChanges();
        return image.Id;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing && Directory.Exists(UploadsPath))
        {
            Directory.Delete(UploadsPath, recursive: true);
        }
    }

    public HttpClient ClientFor(string? token = null)
    {
        var client = CreateClient();
        if (token is not null)
        {
            client.DefaultRequestHeaders.Authorization = new("Bearer", token);
        }
        return client;
    }
}
