using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.Extensions.DependencyInjection;

namespace Backend.Tests;

// Ngarkimi dhe fshirja e fotove përmes API-t: vetëm JPG/PNG të vërteta (sipas bajteve, jo emrit), gjithçka ose asgjë,
// maksimumi 5 për raport, vetëm te raporti i vet dhe vetëm kur është New.
public class ImageUploadTests : IClassFixture<ApiFactory>
{
    private static readonly byte[] Png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00];
    private static readonly byte[] Jpeg = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10];

    private readonly ApiFactory _factory;

    public ImageUploadTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private static MultipartFormDataContent Form(params (string Name, byte[] Bytes)[] files)
    {
        var form = new MultipartFormDataContent();
        foreach (var (name, bytes) in files)
        {
            var content = new ByteArrayContent(bytes);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            form.Add(content, "files", name);
        }
        return form;
    }

    private Task<HttpResponseMessage> Upload(string token, int reportId, params (string Name, byte[] Bytes)[] files) =>
        _factory.ClientFor(token).PostAsync($"/api/reports/{reportId}/images", Form(files));

    private int ImageCount(int reportId)
    {
        using var scope = _factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<AppDbContext>().Images.Count(i => i.ReportId == reportId);
    }

    private static async Task<string?> Message(HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<Dictionary<string, string>>())?["message"];

    [Fact]
    public async Task FotoTeVerteta_Ruhen_MeEmerTeRastesishem()
    {
        var (userId, token) = _factory.CreateUser("NgarkuesiA");
        var reportId = _factory.CreateReport(userId);

        var response = await Upload(token, reportId, ("rruga.png", Png), ("gropa.JPEG", Jpeg));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var images = await response.Content.ReadFromJsonAsync<List<ImageDto>>();
        Assert.Equal(2, images!.Count);
        Assert.All(images, i => Assert.StartsWith($"/api/reports/{reportId}/images/", i.Url));

        // Emri i klientit nuk përdoret kurrë te disku; prapashtesa vendoset nga serveri (.jpeg → .jpg).
        using var scope = _factory.Services.CreateScope();
        var paths = scope.ServiceProvider.GetRequiredService<AppDbContext>()
            .Images.Where(i => i.ReportId == reportId).Select(i => i.FilePath).ToList();
        Assert.Contains(paths, p => p.EndsWith(".png"));
        Assert.Contains(paths, p => p.EndsWith(".jpg"));
        Assert.DoesNotContain(paths, p => p.Contains("rruga") || p.Contains("gropa"));
        Assert.All(paths, p => Assert.True(File.Exists(Path.Combine(_factory.UploadsPath, p))));
    }

    [Theory]
    [InlineData("foto.jpg", "tekst, jo foto")] // emri gënjen: bajtet nuk janë JPG
    [InlineData("foto.png", "\xFF\xD8\xFF")]   // JPG i maskuar si PNG
    [InlineData("foto.gif", "GIF89a")]         // lloj që nuk lejohet
    [InlineData("bosh.png", "")]               // file bosh
    public async Task FileIPavlefshem_Kthen400_DheNukRuhetAsgje(string name, string content)
    {
        var (userId, token) = _factory.CreateUser("NgarkuesiB" + Guid.NewGuid().ToString("N")[..6]);
        var reportId = _factory.CreateReport(userId);
        var bytes = content.Select(c => (byte)c).ToArray();

        // Një foto e mirë bashkë me një të keqe: gjithçka ose asgjë.
        var response = await Upload(token, reportId, ("mire.png", Png), (name, bytes));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains(name, await Message(response));
        Assert.Equal(0, ImageCount(reportId));
    }

    [Fact]
    public async Task MeShumeSe5FotoPerRaport_Kthen400()
    {
        var (userId, token) = _factory.CreateUser("NgarkuesiC");
        var reportId = _factory.CreateReport(userId);
        for (var i = 0; i < 4; i++)
        {
            _factory.CreateImage(reportId);
        }

        var response = await Upload(token, reportId, ("a.png", Png), ("b.png", Png));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("Maksimumi është 5", await Message(response));
        Assert.Equal(4, ImageCount(reportId));
        Assert.Equal(HttpStatusCode.Created, (await Upload(token, reportId, ("e-pesta.png", Png))).StatusCode);
    }

    [Fact]
    public async Task RaportiIHuaj_Kthen404_DheRaportiNeShqyrtim_Kthen409()
    {
        var (ownerId, ownerToken) = _factory.CreateUser("NgarkuesiD");
        var (_, strangerToken) = _factory.CreateUser("NgarkuesiE");
        var newReport = _factory.CreateReport(ownerId);
        var inProgress = _factory.CreateReport(ownerId, ReportStatus.InProgress);
        var imageId = _factory.CreateImage(inProgress);

        Assert.Equal(HttpStatusCode.NotFound, (await Upload(strangerToken, newReport, ("a.png", Png))).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await Upload(ownerToken, inProgress, ("a.png", Png))).StatusCode);

        var delete = await _factory.ClientFor(ownerToken).DeleteAsync($"/api/reports/{inProgress}/images/{imageId}");
        Assert.Equal(HttpStatusCode.Conflict, delete.StatusCode);
        Assert.Equal(1, ImageCount(inProgress));
    }

    [Fact]
    public async Task Fshirja_HeqRreshtinDheFileNgaDisku()
    {
        var (userId, token) = _factory.CreateUser("NgarkuesiF");
        var (_, strangerToken) = _factory.CreateUser("NgarkuesiG");
        var reportId = _factory.CreateReport(userId);
        var imageId = _factory.CreateImage(reportId);
        string fileName;
        using (var scope = _factory.Services.CreateScope())
        {
            fileName = scope.ServiceProvider.GetRequiredService<AppDbContext>().Images.Single(i => i.Id == imageId).FilePath;
        }
        var url = $"/api/reports/{reportId}/images/{imageId}";

        Assert.Equal(HttpStatusCode.NotFound, (await _factory.ClientFor(strangerToken).DeleteAsync(url)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await _factory.ClientFor(token).DeleteAsync(url)).StatusCode);

        Assert.Equal(0, ImageCount(reportId));
        Assert.False(File.Exists(Path.Combine(_factory.UploadsPath, fileName)));
    }
}
