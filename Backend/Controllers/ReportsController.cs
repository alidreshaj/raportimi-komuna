using Backend.DTOs;
using Backend.Extensions;
using Backend.Models;
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

    // GET /api/reports: të gjitha raportet, me filtra opsionalë (vetëm Admin).
    [HttpGet]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<ReportDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAll(ReportStatus? status, int? categoryId, DateOnly? from, DateOnly? to)
    {
        if (from.HasValue && to.HasValue && from > to)
        {
            return BadRequest(new { message = "Data 'from' nuk mund të jetë pas datës 'to'." });
        }

        var reports = await _reportService.GetAllAsync(status, categoryId, from, to);
        return Ok(reports);
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

    // PUT /api/reports/{id}: qytetari ndryshon raportin e vet (vetëm kur është New).
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Citizen")]
    [ProducesResponseType(typeof(ReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, UpdateReportDto dto)
    {
        var (result, report) = await _reportService.UpdateAsync(User.GetUserId(), id, dto);

        return result switch
        {
            ReportActionResult.Success => Ok(report),
            ReportActionResult.NotFound => NotFound(),
            ReportActionResult.NotEditable => Conflict(new { message = "Raporti nuk mund të ndryshohet pasi komuna e ka marrë në shqyrtim." }),
            _ => BadRequest(new { message = "Kategoria nuk ekziston." })
        };
    }

    // PATCH /api/reports/{id}/status: admini ndryshon statusin (vetëm sipas rrugëve të lejuara).
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ReportDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> UpdateStatus(int id, UpdateStatusDto dto)
    {
        var (result, report) = await _reportService.UpdateStatusAsync(id, dto.Status!.Value);

        return result switch
        {
            ReportActionResult.Success => Ok(report),
            ReportActionResult.NotFound => NotFound(),
            _ => Conflict(new { message = "Ky ndryshim statusi nuk lejohet. Rrugët: New → InProgress → Resolved, ose New → Rejected." })
        };
    }

    // DELETE /api/reports/{id}: qytetari fshin raportin e vet (vetëm kur është New).
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Citizen")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _reportService.DeleteAsync(User.GetUserId(), id);

        return result switch
        {
            ReportActionResult.Success => NoContent(),
            ReportActionResult.NotFound => NotFound(),
            _ => Conflict(new { message = "Raporti nuk mund të fshihet pasi komuna e ka marrë në shqyrtim." })
        };
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
