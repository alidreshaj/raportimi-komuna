namespace Backend.Services;

// Mbështjell BCrypt, që pjesa tjetër e kodit të mos varet direkt nga biblioteka.
public class PasswordHasher
{
    // Kthen hash-in e password-it. BCrypt shton vetë një "kripë" të rastësishme.
    public string Hash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    // Krahason password-in e dërguar me hash-in e ruajtur në databazë.
    public bool Verify(string password, string passwordHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
}
