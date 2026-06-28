using auth.Services;
using Microsoft.AspNetCore.Mvc;

namespace auth.Controllers;

[ApiController]
[Route("auth/oauth")]
public class OAuthController : ControllerBase
{
	private readonly FortyTwoOAuthService _oauthService;

	private const string RefreshTokenCookie = "refresh_token";

	private static readonly CookieOptions RefreshCookieOptions = new()
	{
		HttpOnly = true,
		Secure = true,
		SameSite = SameSiteMode.Strict,
		Path = "/api/auth/refresh",
		MaxAge = TimeSpan.FromDays(7)
	};

	public OAuthController(FortyTwoOAuthService oauthService)
	{
		_oauthService = oauthService;
	}

	private string GetHost()
	{
		var host = Request.Headers["X-Forwarded-Host"].FirstOrDefault()
				?? Request.Headers["Host"].FirstOrDefault()
				?? "localhost";
		var port = Request.Headers["X-Forwarded-Port"].FirstOrDefault();
		
		if (!string.IsNullOrEmpty(port) && port != "443")
			return $"{host}:{port}";
		
		return host;
	}

	[HttpGet("42")]
	public IActionResult RedirectTo42()
	{
		var host = GetHost();
		var redirectUri = $"https://{host}/api/auth/oauth/42/callback";
		Console.WriteLine($"[OAuth] Redirect URI: {redirectUri}");
		var url = _oauthService.GetAuthorizationUrl(redirectUri);
		return Redirect(url);
	}

	[HttpGet("42/callback")]
	public async Task<IActionResult> Callback([FromQuery] string? code, [FromQuery] string? error)
	{
		var host = GetHost();
		var redirectUri = $"https://{host}/api/auth/oauth/42/callback";

		if (!string.IsNullOrEmpty(error) || string.IsNullOrEmpty(code))
			return Redirect($"https://{host}/?error=oauth_denied");

		var (success, err, result) = await _oauthService.HandleCallbackAsync(code, redirectUri);

		if (!success)
			return Redirect($"https://{host}/?error=oauth_failed");

		Response.Cookies.Append(RefreshTokenCookie, result!.Value.refreshToken, RefreshCookieOptions);
		var token = result.Value.response.AccessToken;
		return Redirect($"https://{host}/game?token={Uri.EscapeDataString(token)}");
	}
}
