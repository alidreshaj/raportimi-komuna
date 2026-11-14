using Backend.Services;

namespace Backend.Tests;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Hash_NukEshteFjalekalimiIThjeshte()
    {
        var hash = _hasher.Hash("Fjalekalim123");

        Assert.NotEqual("Fjalekalim123", hash);
    }

    [Fact]
    public void Verify_PranonFjalekalimineSakte()
    {
        var hash = _hasher.Hash("Fjalekalim123");

        Assert.True(_hasher.Verify("Fjalekalim123", hash));
    }

    [Fact]
    public void Verify_RefuzonFjalekalimineGabim()
    {
        var hash = _hasher.Hash("Fjalekalim123");

        Assert.False(_hasher.Verify("tjeter", hash));
    }

    [Fact]
    public void Hash_JepHashTeNdryshemPerTeNjejtinFjalekalim()
    {
        // BCrypt shton një "kripë" të rastësishme, prandaj dy hash-e nuk përputhen.
        Assert.NotEqual(_hasher.Hash("Fjalekalim123"), _hasher.Hash("Fjalekalim123"));
    }
}
