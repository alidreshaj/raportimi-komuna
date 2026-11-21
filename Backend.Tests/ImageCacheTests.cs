using System.Net;

namespace Backend.Tests;

// Fotot e mbrojtura: autorizimi, dhe cache-i me ETag që kursen bajte pa e lënë foton te përdorues pa të drejtë.
public class ImageCacheTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public ImageCacheTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Fotoja_KthenETag_DheCacheControlPrivate_DheNjeKerkesaMeETagKthen304()
    {
        var (ownerId, ownerToken) = _factory.CreateUser("FotoPronari");
        var reportId = _factory.CreateReport(ownerId);
        var imageId = _factory.CreateImage(reportId);
        var url = $"/api/reports/{reportId}/images/{imageId}";

        var first = await _factory.ClientFor(ownerToken).GetAsync(url);

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal("image/png", first.Content.Headers.ContentType!.MediaType);
        Assert.True(first.Headers.CacheControl!.Private);
        Assert.True(first.Headers.CacheControl.NoCache);
        Assert.NotNull(first.Headers.ETag);

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.IfNoneMatch.Add(first.Headers.ETag);
        request.Headers.Authorization = new("Bearer", ownerToken);
        var second = await _factory.CreateClient().SendAsync(request);

        Assert.Equal(HttpStatusCode.NotModified, second.StatusCode);
    }

    [Fact]
    public async Task ETag_NukIJepFotonNjeriuQeNukKaTeDrejte()
    {
        var (ownerId, _) = _factory.CreateUser("FotoPronari2");
        var (_, strangerToken) = _factory.CreateUser("FotoIHuaj");
        var reportId = _factory.CreateReport(ownerId);
        var imageId = _factory.CreateImage(reportId);

        // Edhe nëse e di ETag-un, serveri kontrollon të drejtën para se të përgjigjet 304.
        var response = await _factory.ClientFor(strangerToken).GetAsync($"/api/reports/{reportId}/images/{imageId}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
