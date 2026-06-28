using System.Text.Json;
using auth.Data;
using auth.Models;
using Microsoft.AspNetCore.Identity;

namespace auth.Services;

public class FortyTwoOAuthService
{
	private readonly IConfiguration _config;
	private readonly UserManager<AppUser> _userManager;
	private readonly TokenService _tokenService;
	private readonly AppDbContext _db;
	private readonly HttpClient _http;

	private string ClientId => _config["FortyTwo_ClientId"]!;
	private string ClientSecret => _config["FortyTwo_ClientSecret"]!;
	private string RedirectUri => _config["FortyTwo_RedirectUri"]!;

	public FortyTwoOAuthService(
		IConfiguration config,
		UserManager<AppUser> userManager,
		TokenService tokenService,
		AppDbContext db,
		IHttpClientFactory httpClientFactory)
	{
		_config = config;
		_userManager = userManager;
		_tokenService = tokenService;
		_db = db;
		_http = httpClientFactory.CreateClient();
	}

	public string GetAuthorizationUrl(string redirectUri)
	{
		var query = new Dictionary<string, string?>
		{
			["client_id"] = ClientId,
			["redirect_uri"] = redirectUri,
			["response_type"] = "code",
			["scope"] = "public",
		};

		var queryString = string.Join("&", query.Select(kv =>
			$"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value ?? "")}"));

		return $"https://api.intra.42.fr/oauth/authorize?{queryString}";
	}

	public async Task<(bool success, string? error, (AuthResponse response, string refreshToken)?)> HandleCallbackAsync(string code, string redirectUri)
	{
		var tokenRes = await _http.PostAsync("https://api.intra.42.fr/oauth/token",
		new FormUrlEncodedContent(new Dictionary<string, string>
		{
			["grant_type"] = "authorization_code",
			["client_id"] = ClientId,
			["client_secret"] = ClientSecret,
			["code"] = code,
			["redirect_uri"] = redirectUri,
		}));

		if (!tokenRes.IsSuccessStatusCode)
			return (false, "Failed to exchange code for token", null);

		var tokenJson = await tokenRes.Content.ReadAsStringAsync();
		var tokenDoc = JsonDocument.Parse(tokenJson);
		var accessToken = tokenDoc.RootElement.GetProperty("access_token").GetString();

		var profileReq = new HttpRequestMessage(HttpMethod.Get, "https://api.intra.42.fr/v2/me");
		profileReq.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
		var profileRes = await _http.SendAsync(profileReq);

		if (!profileRes.IsSuccessStatusCode)
			return (false, "Failed to fetch 42 profile", null);

		var profileJson = await profileRes.Content.ReadAsStringAsync();
		var profileDoc = JsonDocument.Parse(profileJson);
		var login = profileDoc.RootElement.GetProperty("login").GetString()!;
		var email = profileDoc.RootElement.GetProperty("email").GetString()!;

		var user = await _userManager.FindByEmailAsync(email);

		if (user == null)
		{
			user = new AppUser
			{
				UserName = login,
				Email = email,
				EmailConfirmed = true,
				FortyTwoLogin = login,
			};

			var result = await _userManager.CreateAsync(user);
			if (!result.Succeeded)
			{
				var errors = string.Join(", ", result.Errors.Select(e => e.Description));
				return (false, errors, null);
			}
		}
		else
		{
			if (string.IsNullOrEmpty(user.FortyTwoLogin))
			{
				user.FortyTwoLogin = login;
				await _userManager.UpdateAsync(user);
			}
		}

		return (true, null, await BuildTokenResponse(user));
	}

	private async Task<(AuthResponse response, string refreshToken)> BuildTokenResponse(AppUser user)
	{
		var (accessToken, _, expiresAt) = _tokenService.GenerateAccessToken(user);
		var refreshToken = GenerateRefreshToken();

		user.RefreshToken = refreshToken;
		user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
		await _userManager.UpdateAsync(user);

		return (new AuthResponse(accessToken, expiresAt), refreshToken);
	}

	private static string GenerateRefreshToken()
	{
		var bytes = new byte[64];
		System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
		return Convert.ToBase64String(bytes);
	}
}
