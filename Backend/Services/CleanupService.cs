using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

// Punë në sfond: një herë në ditë fshin të dhënat që nuk duhen më, që tabelat të mos rriten pa fund.
public class CleanupService : BackgroundService
{
    // Njoftimet e lexuara ruhen kaq ditë; të palexuarat nuk preken kurrë.
    private const int ReadNotificationDays = 90;
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);

    private readonly IServiceScopeFactory _scopes;
    private readonly ILogger<CleanupService> _logger;

    public CleanupService(IServiceScopeFactory scopes, ILogger<CleanupService> logger)
    {
        _scopes = scopes;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);

        do
        {
            try
            {
                await CleanAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Një dështim (p.sh. databaza e fikur) nuk duhet ta rrëzojë API-n; provohet përsëri nesër.
                _logger.LogWarning(ex, "Pastrimi i përditshëm dështoi.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task CleanAsync(CancellationToken ct)
    {
        // DbContext është "scoped", prandaj çdo pastrim hap scope-in e vet.
        using var scope = _scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var notificationCutoff = DateTime.UtcNow.AddDays(-ReadNotificationDays);
        var notifications = await db.Notifications
            .Where(n => n.ReadAt != null && n.ReadAt < notificationCutoff)
            .ExecuteDeleteAsync(ct);

        var tokenCutoff = DateTime.UtcNow.AddDays(-1);
        var tokens = await db.PasswordResetTokens
            .Where(t => t.ExpiresAt < tokenCutoff)
            .ExecuteDeleteAsync(ct);

        _logger.LogInformation("Pastrimi: {Notifications} njoftime dhe {Tokens} kode rivendosjeje u fshinë.", notifications, tokens);
    }
}
