using System.Net;
using System.Text;
using Backend.Models;
using Backend.Services;

namespace Backend.Tests;

public class ExportTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public ExportTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Theory]
    [InlineData("Gropë", "Gropë")]
    [InlineData("Rruga A, nr. 5", "\"Rruga A, nr. 5\"")]
    [InlineData("Ai tha \"mjaft\"", "\"Ai tha \"\"mjaft\"\"\"")]
    [InlineData("rresht1\nrresht2", "\"rresht1\nrresht2\"")]
    [InlineData("", "")]
    public void Escape_VendosThonezaKurKaNevoje(string input, string expected)
    {
        Assert.Equal(expected, CsvWriter.Escape(input));
    }

    [Theory]
    [InlineData("=HYPERLINK(\"http://keq.example\")", "\"'=HYPERLINK(\"\"http://keq.example\"\")\"")]
    [InlineData("+1+1", "'+1+1")]
    [InlineData("-2", "'-2")]
    [InlineData("@SUM(A1)", "'@SUM(A1)")]
    public void Escape_ParandalonInjektimEFormulave(string input, string expected)
    {
        Assert.Equal(expected, CsvWriter.Escape(input));
    }

    [Fact]
    public void Build_FillonMeUtf8Bom_DheNdanRreshtatMeCrLf()
    {
        var bytes = CsvWriter.Build(["A", "B"], [["1", "2"]]);

        Assert.Equal([0xEF, 0xBB, 0xBF], bytes[..3]);
        Assert.Equal("A,B\r\n1,2\r\n", Encoding.UTF8.GetString(bytes[3..]));
    }

    [Fact]
    public async Task Eksporti_VetemPerAdmin_DheKthenCsvMeRaportet()
    {
        var (citizenId, citizenToken) = _factory.CreateUser("EksportQytetar");
        var (_, adminToken) = _factory.CreateUser("EksportAdmin", Role.Admin);
        _factory.CreateReport(citizenId);

        Assert.Equal(HttpStatusCode.Forbidden, (await _factory.ClientFor(citizenToken).GetAsync("/api/reports/export")).StatusCode);

        var response = await _factory.ClientFor(adminToken).GetAsync("/api/reports/export");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/csv", response.Content.Headers.ContentType!.MediaType);

        var text = Encoding.UTF8.GetString((await response.Content.ReadAsByteArrayAsync())[3..]);
        var lines = text.Split("\r\n", StringSplitOptions.RemoveEmptyEntries);
        Assert.StartsWith("Nr,Titulli,Kategoria", lines[0]);
        Assert.Contains("Gropë në rrugë", lines[1]);
        Assert.Contains("E re", lines[1]);
    }

    [Fact]
    public async Task Eksporti_RespektonFiltrin()
    {
        var (citizenId, _) = _factory.CreateUser("EksportFiltri");
        var (_, adminToken) = _factory.CreateUser("EksportAdminFiltri", Role.Admin);
        _factory.CreateReport(citizenId, ReportStatus.Resolved);

        var response = await _factory.ClientFor(adminToken).GetAsync("/api/reports/export?status=Rejected");
        var text = Encoding.UTF8.GetString((await response.Content.ReadAsByteArrayAsync())[3..]);

        Assert.Single(text.Split("\r\n", StringSplitOptions.RemoveEmptyEntries)); // vetëm titulli i kolonave
    }
}
