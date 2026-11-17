using System.Security.Claims;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services;

// Kontrollon që një token i vlefshëm (firmë, skadencë) është ende i pranueshëm: përdoruesi ekziston dhe ka të njëjtin version token.
// Pas ndryshimit ose rivendosjes së fjalëkalimit versioni rritet, kështu tokenet e vjetra (p.sh. nga një pajisje e vjedhur) mbyllen menjëherë.
public class SessionValidator
{
    // Emri i pretendimit (claim) që mban versionin brenda tokenit.
    public const string VersionClaim = "ver";

    private readonly AppDbContext _db;

    public SessionValidator(AppDbContext db)
    {
        _db = db;
    }

    public async Task<bool> IsCurrentAsync(ClaimsPrincipal principal)
    {
        var idText = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var versionText = principal.FindFirstValue(VersionClaim);

        // Tokenet pa version (të lëshuara para kësaj ndryshimi) nuk pranohen: përdoruesi hyn një herë përsëri.
        if (!int.TryParse(idText, out var userId) || !int.TryParse(versionText, out var version))
        {
            return false;
        }

        return await _db.Users.AnyAsync(u => u.Id == userId && u.TokenVersion == version);
    }
}
