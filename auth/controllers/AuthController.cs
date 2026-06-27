using System.Security.Claims;
using auth.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace auth.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
	private readonly Services.auth _auth;

	public AuthController(Services.auth auth)
	{
		_auth = auth;
	}

	[HttpPost("register")]
	public async Task<IActionResult> Register([FromBody] RegisterRequest req)
	{
		var (success, error, response) = await _auth.RegisterAsync(req.Email, req.Password);
		if (!success) return BadRequest(new MessageResponse(error!));
		return Ok(response);
	}

	[HttpPost("login")]
	public async Task<IActionResult> Login([FromBody] LoginRequest req)
	{
		var (success, error, response) = await _auth.LoginAsync(req.Email, req.Password);
		if (!success) return Unauthorized(new MessageResponse(error!));
		return Ok(response);
	}

	[HttpPost("refresh")]
	public async Task<IActionResult> Refresh([FromBody] RefreshRequest req)
	{
		var (success, error, response) = await _auth.RefreshAsync(req.RefreshToken);
		if (!success) return Unauthorized(new MessageResponse(error!));
		return Ok(response);
	}

	[HttpPost("logout")]
	[Authorize]
	public async Task<IActionResult> Logout()
	{
		var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
				?? User.FindFirstValue("sub");

		if (userId == null) return Unauthorized();

		await _auth.LogoutAsync(userId);
		return Ok(new MessageResponse("Logged out successfully"));
	}

	[HttpGet("me")]
	[Authorize]
	public IActionResult Me()
	{
		var email = User.FindFirstValue(ClaimTypes.Email)
				?? User.FindFirstValue("email");
		return Ok(new { email });
	}
}
