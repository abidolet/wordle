using System.IdentityModel.Tokens.Jwt;
using auth.Models;
using auth.Services;
using Microsoft.AspNetCore.Mvc;

namespace auth.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
	private readonly AuthManager _authManager;

	private const string RefreshTokenCookie = "refresh_token";

	private static readonly CookieOptions RefreshCookieOptions = new()
	{
		HttpOnly = true,
		Secure = true,
		SameSite = SameSiteMode.Strict,
		Path = "/auth/refresh",
		MaxAge = TimeSpan.FromDays(7)
	};

	public AuthController(AuthManager authManager)
	{
		_authManager = authManager;
	}

	[HttpPost("register")]
	public async Task<IActionResult> Register([FromBody] RegisterRequest req)
	{
		var (success, error, result) = await _authManager.RegisterAsync(req.Email, req.Password);
		if (!success) return BadRequest(new MessageResponse(error!));
		SetRefreshCookie(result!.Value.refreshToken);
		return Ok(result.Value.response);
	}

	[HttpPost("login")]
	public async Task<IActionResult> Login([FromBody] LoginRequest req)
	{
		var (success, error, result) = await _authManager.LoginAsync(req.Email, req.Password);
		if (!success) return Unauthorized(new MessageResponse(error!));
		SetRefreshCookie(result!.Value.refreshToken);
		return Ok(result.Value.response);
	}

	[HttpPost("refresh")]
	public async Task<IActionResult> Refresh()
	{
		var refreshToken = Request.Cookies[RefreshTokenCookie];
		if (string.IsNullOrEmpty(refreshToken))
			return Unauthorized(new MessageResponse("Missing refresh token"));

		var (success, error, result) = await _authManager.RefreshAsync(refreshToken);
		if (!success)
		{
			DeleteRefreshCookie();
			return Unauthorized(new MessageResponse(error!));
		}

		SetRefreshCookie(result!.Value.refreshToken);
		return Ok(result.Value.response);
	}

	[HttpPost("logout")]
	public async Task<IActionResult> Logout()
	{
		var userId = Request.Headers["X-User-Id"].FirstOrDefault();
		var jti = Request.Headers["X-JWT-Jti"].FirstOrDefault();
		var expHeader = Request.Headers["X-JWT-Exp"].FirstOrDefault();

		if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(jti) || string.IsNullOrEmpty(expHeader))
			return Unauthorized(new MessageResponse("Missing identity headers"));

		var expiry = DateTimeOffset.FromUnixTimeSeconds(long.Parse(expHeader)).UtcDateTime;
		await _authManager.LogoutAsync(userId, jti, expiry);

		DeleteRefreshCookie();
		return Ok(new MessageResponse("Logged out successfully"));
	}

	[HttpGet("me")]
	public IActionResult Me()
	{
		var email = Request.Headers["X-JWT-Email"].FirstOrDefault();
		if (string.IsNullOrEmpty(email))
			return Unauthorized(new MessageResponse("Missing identity headers"));

		return Ok(new { email });
	}

	[HttpGet("validate")]
	public async Task<IActionResult> Validate()
	{
		var jti = Request.Headers["X-JWT-Jti"].FirstOrDefault();
		if (string.IsNullOrEmpty(jti))
			return Unauthorized(new MessageResponse("Missing jti"));

		if (await _authManager.IsTokenRevokedAsync(jti))
			return Unauthorized(new MessageResponse("Token has been revoked"));

		return Ok();
	}

	private void SetRefreshCookie(string token) =>
		Response.Cookies.Append(RefreshTokenCookie, token, RefreshCookieOptions);

	private void DeleteRefreshCookie() =>
		Response.Cookies.Delete(RefreshTokenCookie, new CookieOptions
		{
			Path = "/auth/refresh"
		});
}
