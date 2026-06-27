using System.Text;
using auth.Data;
using auth.Models;
using auth.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
	options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
	options.Password.RequiredLength = 8;
	options.Password.RequireDigit = true;
	options.Password.RequireUppercase = true;
	options.Password.RequireNonAlphanumeric = true;

	options.Lockout.MaxFailedAccessAttempts = 5;
	options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
	options.Lockout.AllowedForNewUsers = true;

	options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

var jwtSecret = builder.Configuration["Jwt_Secret"]
	?? throw new InvalidOperationException("Jwt_Secret manquant");

builder.Services.AddAuthentication(options =>
{
	options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
	options.TokenValidationParameters = new TokenValidationParameters
	{
		ValidateIssuer = true,
		ValidateAudience = true,
		ValidateLifetime = true,
		ValidateIssuerSigningKey = true,
		ValidIssuer = builder.Configuration["Jwt_Issuer"],
		ValidAudience = builder.Configuration["Jwt_Audience"],
		IssuerSigningKey = new SymmetricSecurityKey(
			Encoding.UTF8.GetBytes(jwtSecret)),
		ClockSkew = TimeSpan.Zero
	};
});

builder.Services.AddAuthorization();

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<auth.Services.auth>();

builder.Services.AddControllers();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
	var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
	db.Database.Migrate();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

const string Green = "\x1b[32m";
const string Reset = "\x1b[0m";
app.Logger.LogInformation($"\n\n{Green}Auth Service is ready!{Reset}\n\n");

app.Run();

