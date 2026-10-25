using Backend.DTOs;
using Backend.Extensions;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notifications;

    public NotificationsController(NotificationService notifications)
    {
        _notifications = notifications;
    }

    // GET /api/notifications?limit=20: njoftimet e mia (më të rejat të parat) dhe sa janë të palexuara.
    [HttpGet]
    [ProducesResponseType(typeof(NotificationListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine([FromQuery] int limit = 20)
    {
        return Ok(await _notifications.GetAsync(User.GetUserId(), Math.Clamp(limit, 1, 50)));
    }

    // GET /api/notifications/unread-count: vetëm numri i të palexuarave. I lehtë, për pyetjen periodike të zilës.
    [HttpGet("unread-count")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> UnreadCount()
    {
        return Ok(new { count = await _notifications.UnreadCountAsync(User.GetUserId()) });
    }

    // POST /api/notifications/{id}/read: e shënon një njoftim si të lexuar (vetëm të vetin; të tjerët marrin 404).
    [HttpPost("{id:int}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkRead(int id)
    {
        return await _notifications.MarkReadAsync(User.GetUserId(), id) ? NoContent() : NotFound();
    }

    // POST /api/notifications/read-all: i shënon të gjitha njoftimet e mia si të lexuara.
    [HttpPost("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> MarkAllRead()
    {
        await _notifications.MarkAllReadAsync(User.GetUserId());
        return NoContent();
    }
}
