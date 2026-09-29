using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    // GET /api/health: përdoret për të parë që API-ja po punon.
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "OK", time = DateTime.UtcNow });
    }
}
