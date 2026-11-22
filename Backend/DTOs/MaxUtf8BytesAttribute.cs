using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Backend.DTOs;

// Kufizon gjatësinë në BAJT (jo në karaktere). Për fjalëkalimet: BCrypt lexon vetëm 72 bajtët e parë dhe shkurton heshtazi
// pjesën tjetër, prandaj një fjalëkalim i gjatë do të ishte njësoj me atë që ka të njëjtat 72 bajtë të parë.
// Shkronjat si ë dhe ç zënë 2 bajt, prandaj kufiri në bajt është pak më i ulët se numri i karaktereve.
[AttributeUsage(AttributeTargets.Property)]
public sealed class MaxUtf8BytesAttribute : ValidationAttribute
{
    private readonly int _max;

    public MaxUtf8BytesAttribute(int max)
    {
        _max = max;
    }

    public override bool IsValid(object? value)
    {
        return value is not string text || Encoding.UTF8.GetByteCount(text) <= _max;
    }
}
