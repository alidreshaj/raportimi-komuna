using System.Security.Claims;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    // POST /api/auth/register: regjistrim i qytetarit.
    [HttpPost("register")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = await _authService.RegisterAsync(dto);

        if (user is null)
        {
            return Conflict(new { message = "Ky email është i regjistruar tashmë." });
        }

        return StatusCode(StatusCodes.Status201Created, user);
    }

    // POST /api/auth/login: hyrje në sistem, kthen JWT token.
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);

        if (result is null)
        {
            return Unauthorized(new { message = "Email ose password i gabuar." });
        }

        return Ok(result);
    }

    // PUT /api/auth/me: ndryshon emrin e llogarisë sime. Kthen një token të ri (emri është brenda tokenit).
    [HttpPut("me")]
    [Authorize]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateMe(UpdateProfileDto dto)
    {
        var result = await _authService.UpdateProfileAsync(int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!), dto);
        return result is null ? NotFound() : Ok(result);
    }

    // POST /api/auth/change-password: ndryshon fjalëkalimin kur je i loguar (kërkon fjalëkalimin aktual).
    // Fjalëkalimi aktual i gabuar kthen 400, jo 401: frontend-i te 401 e mbyll sesionin, dhe këtu përdoruesi është ende i loguar.
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var result = await _authService.ChangePasswordAsync(int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!), dto);

        return result switch
        {
            AuthService.ChangePasswordResult.Success => NoContent(),
            AuthService.ChangePasswordResult.WrongCurrentPassword => BadRequest(new { message = "Fjalëkalimi aktual është i gabuar." }),
            AuthService.ChangePasswordResult.SameAsCurrent => BadRequest(new { message = "Fjalëkalimi i ri duhet të jetë ndryshe nga ai aktual." }),
            _ => NotFound()
        };
    }

    // POST /api/auth/forgot-password: dërgon lidhjen e rivendosjes. Gjithmonë kthen 204, edhe kur email-i nuk ekziston.
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        await _authService.ForgotPasswordAsync(dto);
        return NoContent();
    }

    // POST /api/auth/reset-password: vendos fjalëkalimin e ri me kodin nga lidhja.
    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        return await _authService.ResetPasswordAsync(dto)
            ? NoContent()
            : BadRequest(new { message = "Lidhja nuk është e vlefshme ose ka skaduar. Kërko një të re." });
    }

    // GET /api/auth/me: kthen të dhënat e përdoruesit të loguar, të lexuara nga tokeni.
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            id = User.FindFirstValue(ClaimTypes.NameIdentifier),
            email = User.FindFirstValue(ClaimTypes.Email),
            name = User.FindFirstValue(ClaimTypes.Name),
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }

    // GET /api/auth/admin-only: endpoint prove, hyn vetëm Admin.
    [HttpGet("admin-only")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminOnly()
    {
        return Ok(new { message = "Je Admin. Ke qasje këtu." });
    }
}
