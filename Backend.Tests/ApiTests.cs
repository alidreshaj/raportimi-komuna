using System.Net;
using System.Net.Http.Json;
using Backend.Models;
using Microsoft.Extensions.DependencyInjection;

namespace Backend.Tests;

// Rregullat e qasjes të provuara përmes HTTP të vërtetë: kodet 401, 403, 404, 409 dhe 400.
public class ApiTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public ApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PaToken_KthenNeKrejt401()
    {
        var response = await _factory.ClientFor().GetAsync("/api/reports/my");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Health_PunonPaToken()
    {
        var response = await _factory.ClientFor().GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Qytetari_NukHynTeEndpointetEAdminit_403()
    {
        var (_, token) = _factory.CreateUser("Qytetar403");
        var client = _factory.ClientFor(token);

        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/reports")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/reports/stats")).StatusCode);
    }

    [Fact]
    public async Task Admini_NukKrijonRaporteDheNukHynTeKomuna_403()
    {
        var (_, token) = _factory.CreateUser("Admin403", Role.Admin);
        var client = _factory.ClientFor(token);

        var create = await client.PostAsJsonAsync("/api/reports", new { title = "x", description = "x", location = "x", categoryId = 1 });

        Assert.Equal(HttpStatusCode.Forbidden, create.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/reports/community")).StatusCode);
    }

    [Fact]
    public async Task Qytetari_NukShohRaportinETjeterDheNukEMbeshtetRaportinEVet()
    {
        var (ownerId, ownerToken) = _factory.CreateUser("Pronari");
        var (_, otherToken) = _factory.CreateUser("Tjetri");
        var reportId = _factory.CreateReport(ownerId);

        // Tjetri nuk e sheh raportin e pronarit (404, jo 403: nuk zbulohet që ekziston), por mund ta mbështesë.
        Assert.Equal(HttpStatusCode.NotFound, (await _factory.ClientFor(otherToken).GetAsync($"/api/reports/{reportId}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await _factory.ClientFor(otherToken).PutAsync($"/api/reports/{reportId}/vote", null)).StatusCode);

        // Pronari e sheh raportin e vet, por nuk e mbështet dot.
        Assert.Equal(HttpStatusCode.OK, (await _factory.ClientFor(ownerToken).GetAsync($"/api/reports/{reportId}")).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await _factory.ClientFor(ownerToken).PutAsync($"/api/reports/{reportId}/vote", null)).StatusCode);
    }

    [Fact]
    public async Task Admini_NdryshonStatusin_Me409PerKalimTePalejuar_Dhe404PerRaportQeNukEkziston()
    {
        var (citizenId, _) = _factory.CreateUser("Pronari409");
        var (_, adminToken) = _factory.CreateUser("Admin409", Role.Admin);
        var reportId = _factory.CreateReport(citizenId);
        var admin = _factory.ClientFor(adminToken);

        var invalid = await admin.PatchAsJsonAsync($"/api/reports/{reportId}/status", new { status = "Resolved" });
        var missing = await admin.PatchAsJsonAsync("/api/reports/9999/status", new { status = "InProgress" });
        var valid = await admin.PatchAsJsonAsync($"/api/reports/{reportId}/status", new { status = "InProgress" });

        Assert.Equal(HttpStatusCode.Conflict, invalid.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        Assert.Equal(HttpStatusCode.OK, valid.StatusCode);
    }

    [Fact]
    public async Task TeDhenaTePavlefshme_Kthejne400_MeMesazhNeShqip()
    {
        var (_, token) = _factory.CreateUser("Validim400");

        var response = await _factory.ClientFor(token).PostAsJsonAsync("/api/reports", new { title = "", description = "x", location = "x", categoryId = 1 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Contains("titull", await response.Content.ReadAsStringAsync(), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task TokeniMeVersionTeVjeter_Refuzohet401()
    {
        var (id, token) = _factory.CreateUser("Version401");
        Assert.Equal(HttpStatusCode.OK, (await _factory.ClientFor(token).GetAsync("/api/auth/me")).StatusCode);

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<Backend.Data.AppDbContext>();
            db.Users.Single(u => u.Id == id).TokenVersion++;
            db.SaveChanges();
        }

        Assert.Equal(HttpStatusCode.Unauthorized, (await _factory.ClientFor(token).GetAsync("/api/auth/me")).StatusCode);
    }
}

internal static class HttpClientExtensions
{
    public static Task<HttpResponseMessage> PatchAsJsonAsync<T>(this HttpClient client, string url, T body)
    {
        return client.PatchAsync(url, JsonContent.Create(body));
    }
}
