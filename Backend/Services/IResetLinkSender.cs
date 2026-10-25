namespace Backend.Services;

// Si i arrin përdoruesit lidhja e rivendosjes. Sot vetëm shkruhet te terminali (nuk kemi shërbim emaili); kur të shtohet emaili,
// zëvendësohet vetëm kjo klasë dhe asgjë tjetër.
public interface IResetLinkSender
{
    Task SendAsync(string email, string name, string link);
}

public class LogResetLinkSender : IResetLinkSender
{
    private readonly ILogger<LogResetLinkSender> _logger;

    public LogResetLinkSender(ILogger<LogResetLinkSender> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string email, string name, string link)
    {
        // Warning, që të dallohet mes rreshtave të tjerë të terminalit.
        _logger.LogWarning("Rivendosja e fjalëkalimit për {Email} ({Name}). Hape këtë lidhje (vlen 30 minuta): {Link}", email, name, link);
        return Task.CompletedTask;
    }
}
