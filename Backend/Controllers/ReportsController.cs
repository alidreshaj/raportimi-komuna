using Backend.DTOs;
using Backend.Extensions;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reportService;

    public ReportsController(ReportService reportService)
    {
        _reportService = reportService;
    }

    // POST /api/reports: qytetari krijon raport.
    [HttpPost]
    [Authorize(Roles = "Citizen")]
    [ProducesResponseType(typeof(ReportDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(CreateReportDto dto)
    {
        var report = await _reportService.CreateAsync(User.GetUserId(), dto);

        if (report is null)
        {
            return BadRequest(new { message = "Kategoria nuk ekziston." });
        }

        return StatusCode(StatusCodes.Status201Created, report);
    }
}
