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

        return CreatedAtAction(nameof(GetById), new { id = report.Id }, report);
    }

    // GET /api/reports/my: raportet e qytetarit të loguar.
    [HttpGet("my")]
    [Authorize(Roles = "Citizen")]
    [ProducesResponseType(typeof(List<ReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMy()
    {
        var reports = await _reportService.GetMyAsync(User.GetUserId());
        return Ok(reports);
    }

    // GET /api/reports/{id}: detajet e një raporti (i zoti ose Admin).
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var report = await _reportService.GetByIdAsync(User.GetUserId(), User.IsInRole("Admin"), id);

        if (report is null)
        {
            return NotFound();
        }

        return Ok(report);
    }
}
