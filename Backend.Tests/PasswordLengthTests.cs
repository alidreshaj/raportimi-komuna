using System.ComponentModel.DataAnnotations;
using Backend.DTOs;
using Backend.Services;

namespace Backend.Tests;

// BCrypt shkurton fjalëkalimet mbi 72 bajt heshtazi: kufiri i DTO-ve e parandalon.
public class PasswordLengthTests
{
    private static bool IsValid(object dto)
    {
        return Validator.TryValidateObject(dto, new ValidationContext(dto), [], validateAllProperties: true);
    }

    [Fact]
    public void BCrypt_ShkurtonHeshtazi_Pas72Bajteve()
    {
        // Dëshmon pse na duhet kufiri: pas 72 bajtëve BCrypt nuk shikon më asgjë.
        var hasher = new PasswordHasher();
        var hash = hasher.Hash(new string('a', 72) + "XXXX");

        Assert.True(hasher.Verify(new string('a', 72) + "YYYY", hash));
    }

    [Fact]
    public void Regjistrimi_Pranon72Bajte_DheRefuzon73()
    {
        Assert.True(IsValid(new RegisterDto { Name = "Ali", Email = "a@b.co", Password = new string('a', 72) }));
        Assert.False(IsValid(new RegisterDto { Name = "Ali", Email = "a@b.co", Password = new string('a', 73) }));
    }

    [Fact]
    public void ShkronjatMeDyBajt_NumerohenSiDy()
    {
        // 37 x "ë" = 74 bajt, edhe pse vetëm 37 karaktere.
        Assert.False(IsValid(new RegisterDto { Name = "Ali", Email = "a@b.co", Password = new string('ë', 37) }));
        Assert.True(IsValid(new RegisterDto { Name = "Ali", Email = "a@b.co", Password = new string('ë', 36) }));
    }

    [Fact]
    public void NdryshimiDheRivendosja_KaneTeNjejtinKufi()
    {
        var tooLong = new string('a', 73);

        Assert.False(IsValid(new ChangePasswordDto { CurrentPassword = "x", NewPassword = tooLong }));
        Assert.False(IsValid(new ResetPasswordDto { Token = "t", NewPassword = tooLong }));
    }

    [Fact]
    public void FjalekalimiAktual_MbetetMeKufirinEVjeter_QePerdoruesitMeFjalekalimTeGjate_TeHyjne()
    {
        Assert.True(IsValid(new ChangePasswordDto { CurrentPassword = new string('a', 90), NewPassword = "FjalekalimIRi1" }));
    }
}
