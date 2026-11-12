using Backend.Data;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;

    public HealthController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/health: 200 nëse API-ja dhe databaza punojnë, 503 nëse databaza nuk arrihet.
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var dbOk = await _db.Database.CanConnectAsync(ct);
        var body = new { status = dbOk ? "OK" : "DatabaseUnavailable", database = dbOk, time = DateTime.UtcNow };

        return dbOk ? Ok(body) : StatusCode(StatusCodes.Status503ServiceUnavailable, body);
    }
}
