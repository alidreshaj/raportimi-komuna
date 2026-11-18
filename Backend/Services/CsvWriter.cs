using System.Text;

namespace Backend.Services;

// Ndërton një file CSV që hapet saktë te Excel (shkronjat ë, ç) dhe që nuk lejon "injektim formulash".
public static class CsvWriter
{
    // Excel e njeh UTF-8 vetëm nëse file-i fillon me këtë shenjë (BOM); pa të, "Pejë" del "PejÃ«".
    private static readonly byte[] Utf8Bom = [0xEF, 0xBB, 0xBF];

    public static byte[] Build(IReadOnlyList<string> header, IEnumerable<IReadOnlyList<string>> rows)
    {
        var sb = new StringBuilder();
        AppendRow(sb, header);
        foreach (var row in rows)
        {
            AppendRow(sb, row);
        }

        return [.. Utf8Bom, .. Encoding.UTF8.GetBytes(sb.ToString())];
    }

    private static void AppendRow(StringBuilder sb, IReadOnlyList<string> cells)
    {
        sb.Append(string.Join(',', cells.Select(Escape))).Append("\r\n");
    }

    // Një qelizë që fillon me = + - @ (ose tab) e interpreton Excel si formulë: dikush mund ta shkruajë te titulli i raportit
    // dhe të ekzekutohet te kompjuteri i adminit kur e hap file-in. Prandaj i vëmë një apostrof përpara, që të mbetet tekst.
    // Pastaj fusha vendoset në thonjëza nëse përmban presje, thonjëza ose rresht të ri.
    public static string Escape(string value)
    {
        if (value.Length > 0 && value[0] is '=' or '+' or '-' or '@' or '\t' or '\r')
        {
            value = "'" + value;
        }

        if (value.IndexOfAny([',', '"', '\r', '\n']) >= 0)
        {
            value = "\"" + value.Replace("\"", "\"\"") + "\"";
        }

        return value;
    }
}
