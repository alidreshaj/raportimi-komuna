using System.Net;
using System.Net.Http.Json;

namespace Backend.Tests;

// Kufizimi i veprimeve që krijojnë gjëra: 30 në minutë për përdorues (jo për IP).
public class RateLimitTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public RateLimitTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Komentet_KufizohenNe30NeMinute_PerPerdorues_PaPrekurTeTjeret()
    {
        var (spammerId, spammerToken) = _factory.CreateUser("Spamer");
        var (calmId, calmToken) = _factory.CreateUser("IQete");
        var spammerReport = _factory.CreateReport(spammerId);
        var calmReport = _factory.CreateReport(calmId);
        var spammer = _factory.ClientFor(spammerToken);

        for (var i = 0; i < 30; i++)
        {
            var ok = await spammer.PostAsJsonAsync($"/api/reports/{spammerReport}/comments", new { text = $"koment {i}" });
            Assert.Equal(HttpStatusCode.Created, ok.StatusCode);
        }

        var blocked = await spammer.PostAsJsonAsync($"/api/reports/{spammerReport}/comments", new { text = "një tepër" });
        Assert.Equal(HttpStatusCode.TooManyRequests, blocked.StatusCode);

        // Një përdorues tjetër (po nga e njëjta adresë) nuk preket.
        var calm = await _factory.ClientFor(calmToken).PostAsJsonAsync($"/api/reports/{calmReport}/comments", new { text = "përshëndetje" });
        Assert.Equal(HttpStatusCode.Created, calm.StatusCode);
    }

    [Fact]
    public async Task Leximet_NukKufizohen()
    {
        var (_, token) = _factory.CreateUser("Lexues");
        var client = _factory.ClientFor(token);

        for (var i = 0; i < 40; i++)
        {
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/reports/my")).StatusCode);
        }
    }
}
