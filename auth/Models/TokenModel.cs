namespace auth.Models;

public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string AccessToken, DateTime ExpiresAt);
public record MessageResponse(string Message);
public record CheckEmailRequest(string Email);
