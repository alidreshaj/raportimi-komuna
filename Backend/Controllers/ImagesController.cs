using Backend.DTOs;
using Backend.Extensions;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/reports/{reportId:int}/images")]
[Authorize]
public class ImagesController : ControllerBase
{
    private readonly ImageService _imageService;

    public ImagesController(ImageService imageService)
    {
        _imageService = imageService;
    }

    // GET /api/reports/{reportId}/images/{imageId}: dërgon foton (i zoti i raportit ose Admin).
    [HttpGet("{imageId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int reportId, int imageId)
    {
        var image = await _imageService.GetFileAsync(User.GetUserId(), User.IsInRole("Admin"), reportId, imageId);

        if (image is null)
        {
            return NotFound();
        }

        // Shfletuesi të mos "hamendësojë" llojin e file-it: trajtoje strikt si foto.
        Response.Headers["X-Content-Type-Options"] = "nosniff";

        // Një foto nuk ndryshon kurrë pasi ngarkohet (ka id të vetën), por është e mbrojtur. "private, no-cache" do të thotë:
        // shfletuesi e ruan, por para çdo përdorimi pyet serverin me ETag. Serveri kontrollon sërish që kërkuesi ka të drejtë
        // (kështu një përdorues tjetër i së njëjtës pajisje nuk e merr foton nga cache-i) dhe përgjigjet 304 pa bajte
        // në vend të foto-s së plotë: lista dhe detajet e të njëjtit raport nuk e shkarkojnë dy herë.
        Response.Headers.CacheControl = "private, no-cache";
        var etag = new Microsoft.Net.Http.Headers.EntityTagHeaderValue($"\"{imageId}-{image.Length}-{image.LastModified.ToUnixTimeSeconds()}\"");
        return PhysicalFile(image.FullPath, image.ContentType, image.LastModified, etag);
    }

    // DELETE /api/reports/{reportId}/images/{imageId}: qytetari heq një foto të raportit të vet (vetëm kur është New).
    [HttpDelete("{imageId:int}")]
    [Authorize(Roles = "Citizen")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int reportId, int imageId)
    {
        var result = await _imageService.DeleteAsync(User.GetUserId(), reportId, imageId);

        return result switch
        {
            ImageDeleteResult.Success => NoContent(),
            ImageDeleteResult.NotFound => NotFound(),
            _ => Conflict(new { message = "Fotoja nuk mund të fshihet pasi komuna e ka marrë raportin në shqyrtim." })
        };
    }

    // POST /api/reports/{reportId}/images: qytetari ngarkon foto te raporti i vet (vetëm kur është New).
    // Kufiri i gjithë kërkesës: 5 foto x 5 MB + pak shtesë. Nëse kalohet, kërkesa refuzohet
    // para se të ruhet gjë (kthehet 400 me mesazh "Request body too large").
    [HttpPost]
    [Authorize(Roles = "Citizen")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(27_000_000)]
    [ProducesResponseType(typeof(List<ImageDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Upload(int reportId, [FromForm] List<IFormFile> files)
    {
        var outcome = await _imageService.UploadAsync(User.GetUserId(), reportId, files);

        return outcome.Result switch
        {
            ImageUploadResult.Success => StatusCode(StatusCodes.Status201Created, outcome.Images),
            ImageUploadResult.NotFound => NotFound(),
            ImageUploadResult.NotEditable => Conflict(new { message = "Fotot nuk mund të ngarkohen pasi komuna e ka marrë raportin në shqyrtim." }),
            _ => BadRequest(new { message = outcome.Message })
        };
    }
}
