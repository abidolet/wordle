using Microsoft.AspNetCore.Identity;

namespace auth.Models;

public class AppUser : IdentityUser
{
	public string? RefreshToken { get; set; }
	public DateTime? RefreshTokenExpiry { get; set; }
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
	public string? FortyTwoLogin { get; set; }
}
