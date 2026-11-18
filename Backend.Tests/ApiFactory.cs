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

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("Jwt:Key", new string('k', 40));
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
