using auth.Data;
using auth.Models;
using Microsoft.AspNetCore.Identity;

namespace auth.Services;

public class auth
{
	private readonly UserManager<AppUser> _userManager;
	private readonly TokenService _tokenService;
	private readonly AppDbContext _db;

	public auth(
		UserManager<AppUser> userManager,
		TokenService tokenService,
		AppDbContext db)
	{
		_userManager = userManager;
		_tokenService = tokenService;
		_db = db;
	}

	public async Task<(bool success, string? error, AuthResponse? response)> RegisterAsync(
		string email, string password)
	{
		var existing = await _userManager.FindByEmailAsync(email);
		if (existing != null)
			return (false, "Email already in use", null);

		var user = new AppUser { UserName = email, Email = email };
		var result = await _userManager.CreateAsync(user, password);

		if (!result.Succeeded)
		{
			var errors = string.Join(", ", result.Errors.Select(e => e.Description));
			return (false, errors, null);
		}

		return (true, null, await BuildTokenResponse(user));
	}

	public async Task<(bool success, string? error, AuthResponse? response)> LoginAsync(
		string email, string password)
	{
		var user = await _userManager.FindByEmailAsync(email);
		if (user == null)
			return (false, "Invalid credentials", null);

		var valid = await _userManager.CheckPasswordAsync(user, password);
		if (!valid)
		{
			await _userManager.AccessFailedAsync(user);
			return (false, "Invalid credentials", null);
		}

		await _userManager.ResetAccessFailedCountAsync(user);
		return (true, null, await BuildTokenResponse(user));
	}

	public async Task<(bool success, string? error, AuthResponse? response)> RefreshAsync(
		string refreshToken)
	{
		var user = _db.Users
			.FirstOrDefault(u => u.RefreshToken == refreshToken);

		if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
			return (false, "Invalid or expired refresh token", null);

		return (true, null, await BuildTokenResponse(user));
	}

	public async Task<bool> LogoutAsync(string userId)
	{
		var user = await _userManager.FindByIdAsync(userId);
		if (user == null) return false;

		user.RefreshToken = null;
		user.RefreshTokenExpiry = null;
		await _userManager.UpdateAsync(user);
		return true;
	}

	private async Task<AuthResponse> BuildTokenResponse(AppUser user)
	{
		var (accessToken, expiresAt) = _tokenService.GenerateAccessToken(user);
		var refreshToken = _tokenService.GenerateRefreshToken();

		user.RefreshToken = refreshToken;
		user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
		await _userManager.UpdateAsync(user);

		return new AuthResponse(accessToken, refreshToken, expiresAt);
	}
}
