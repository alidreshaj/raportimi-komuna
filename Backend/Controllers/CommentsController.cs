using Backend.DTOs;
using Backend.Extensions;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/reports/{reportId:int}/comments")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly CommentService _commentService;

    public CommentsController(CommentService commentService)
    {
        _commentService = commentService;
    }

    // GET /api/reports/{reportId}/comments: komentet e raportit (i zoti ose Admin).
    [HttpGet]
    [ProducesResponseType(typeof(List<CommentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAll(int reportId)
    {
        var comments = await _commentService.GetAsync(User.GetUserId(), User.IsInRole("Admin"), reportId);

        if (comments is null)
        {
            return NotFound();
        }

        return Ok(comments);
    }

    // POST /api/reports/{reportId}/comments: shton koment (i zoti ose Admin).
    [HttpPost]
    [ProducesResponseType(typeof(CommentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create(int reportId, CreateCommentDto dto)
    {
        var comment = await _commentService.CreateAsync(User.GetUserId(), User.IsInRole("Admin"), reportId, dto);

        if (comment is null)
        {
            return NotFound();
        }

        return StatusCode(StatusCodes.Status201Created, comment);
    }
}
