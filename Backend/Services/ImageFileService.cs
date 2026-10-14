namespace Backend.Services;

public enum ImageValidationResult
{
    Ok,
    EmptyFile,   // file bosh
    TooLarge,    // mbi 5 MB
    InvalidType  // prapashtesë e palejuar, ose përmbajtja nuk është JPEG/PNG i vërtetë
}

// Ruan, kontrollon dhe fshin fotot në folderin uploads/.
// Nuk i beson emrit as llojit që thotë klienti: kontrollon bajtet e para të file-it.
public class ImageFileService
{
    public const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB
    public const int MaxImagesPerReport = 5;

    // Të parat bajte të çdo JPEG dhe PNG të vërtetë ("magic bytes").
    private static readonly byte[] JpegSignature = [0xFF, 0xD8, 0xFF];
    private static readonly byte[] PngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

    private readonly string _uploadsPath;

    public ImageFileService(IWebHostEnvironment env)
    {
        _uploadsPath = Path.Combine(env.ContentRootPath, "uploads");
    }

    // Kontrollon file-in. Kthen rezultatin dhe prapashtesën e saktë për ta ruajtur (.jpg ose .png).
    public async Task<(ImageValidationResult Result, string? Extension)> ValidateAsync(IFormFile file)
    {
        if (file.Length == 0)
        {
            return (ImageValidationResult.EmptyFile, null);
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return (ImageValidationResult.TooLarge, null);
        }

        var claimed = Path.GetExtension(file.FileName).ToLowerInvariant();
        var claimsJpeg = claimed is ".jpg" or ".jpeg";
        var claimsPng = claimed == ".png";
        if (!claimsJpeg && !claimsPng)
        {
            return (ImageValidationResult.InvalidType, null);
        }

        // Lexojmë vetëm bajtet e para dhe i krahasojmë me nënshkrimin e llojit që thotë emri.
        var header = new byte[PngSignature.Length];
        int read;
        await using (var stream = file.OpenReadStream())
        {
            read = await stream.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false);
        }

        if (claimsJpeg && StartsWith(header, read, JpegSignature))
        {
            return (ImageValidationResult.Ok, ".jpg");
        }

        if (claimsPng && StartsWith(header, read, PngSignature))
        {
            return (ImageValidationResult.Ok, ".png");
        }

        return (ImageValidationResult.InvalidType, null);
    }

    // Ruan file-in me emër të rastësishëm (jo me emrin e klientit). Kthen emrin e ruajtur.
    public async Task<string> SaveAsync(IFormFile file, string extension)
    {
        Directory.CreateDirectory(_uploadsPath);

        var fileName = Guid.NewGuid().ToString("N") + extension;
        var fullPath = Path.Combine(_uploadsPath, fileName);

        // CreateNew: nuk mbishkruan kurrë një file ekzistues.
        await using var target = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write);
        await file.CopyToAsync(target);

        return fileName;
    }

    // Rruga e plotë e një foto-je të ruajtur. Kthen null nëse emri nuk është i pastër ose file mungon.
    public string? GetFullPath(string fileName)
    {
        if (!IsSafeFileName(fileName))
        {
            return null;
        }

        var fullPath = Path.Combine(_uploadsPath, fileName);
        return File.Exists(fullPath) ? fullPath : null;
    }

    // Fshin foton nga disku. Nuk bën gabim nëse file nuk ekziston.
    public void Delete(string fileName)
    {
        if (!IsSafeFileName(fileName))
        {
            return;
        }

        var fullPath = Path.Combine(_uploadsPath, fileName);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }

    // Vetëm emër i thjeshtë file-i: pa "/", pa "..", pa rrugë.
    private static bool IsSafeFileName(string fileName)
    {
        return !string.IsNullOrEmpty(fileName) && fileName == Path.GetFileName(fileName);
    }

    private static bool StartsWith(byte[] data, int length, byte[] signature)
    {
        return length >= signature.Length && data.AsSpan(0, signature.Length).SequenceEqual(signature);
    }
}
