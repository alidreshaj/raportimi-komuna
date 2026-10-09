using System.Security.Claims;

namespace Backend.Extensions;

public static class ClaimsPrincipalExtensions
{
    // Kthen id-në e përdoruesit të loguar, të lexuar nga tokeni (jo nga kërkesa).
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.Parse(value!);
    }
}
