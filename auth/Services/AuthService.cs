using auth.Data;
using auth.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace auth.Services;

public class AuthManager
{
	private readonly UserManager<AppUser> _userManager;
	private readonly TokenService _tokenService;
	private readonly AppDbContext _db;

	public AuthManager(
		UserManager<AppUser> userManager,
		TokenService tokenService,
		AppDbContext db)
	{
		_userManager = userManager;
		_tokenService = tokenService;
		_db = db;
	}

	public async Task<(bool success, string? error, (AuthResponse response, string refreshToken)?)> RegisterAsync(
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

	public async Task<(bool success, string? error, (AuthResponse response, string refreshToken)?)> LoginAsync(
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

	public async Task<(bool success, string? error, (AuthResponse response, string refreshToken)?)> RefreshAsync(
		string refreshToken)
	{
		var user = _db.Users
			.FirstOrDefault(u => u.RefreshToken == refreshToken);

		if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
			return (false, "Invalid or expired refresh token", null);

		return (true, null, await BuildTokenResponse(user));
	}

	public async Task<bool> LogoutAsync(string userId, string jti, DateTime tokenExpiry)
	{
		var user = await _userManager.FindByIdAsync(userId);
		if (user == null) return false;

		user.RefreshToken = null;
		user.RefreshTokenExpiry = null;
		await _userManager.UpdateAsync(user);

		_db.RevokedTokens.Add(new RevokedToken { Jti = jti, ExpiresAt = tokenExpiry });
		await _db.SaveChangesAsync();
		return true;
	}

	public async Task<bool> IsTokenRevokedAsync(string jti)
	{
		return await _db.RevokedTokens.AnyAsync(t => t.Jti == jti);
	}

	private async Task<(AuthResponse response, string refreshToken)> BuildTokenResponse(AppUser user)
	{
		var (accessToken, _, expiresAt) = _tokenService.GenerateAccessToken(user);
		var refreshToken = _tokenService.GenerateRefreshToken();

		user.RefreshToken = refreshToken;
		user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
		await _userManager.UpdateAsync(user);

		return (new AuthResponse(accessToken, expiresAt), refreshToken);
	}
}
