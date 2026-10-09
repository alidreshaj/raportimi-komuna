using System.Text;
using Backend.Data;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

// Regjistrojmë shërbimet (çfarë "mjetesh" ka aplikacioni).
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<ReportService>();

// Autentikimi: si verifikohet tokeni që vjen me çdo kërkesë.
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Mungon Jwt:Key. Vendose me: dotnet user-secrets set \"Jwt:Key\" \"...\"");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Shton butonin "Authorize" te Swagger, ku ngjitet tokeni JWT.
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Ngjit vetëm tokenin (pa fjalën Bearer)."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});

var app = builder.Build();

// Të dhënat fillestare në nisje: admin-i dhe kategoritë (vetëm nëse mungojnë).
await DbSeeder.SeedAdminAsync(app.Services);
await DbSeeder.SeedCategoriesAsync(app.Services);

// Pipeline i kërkesave: çdo kërkesë kalon nëpër këto hapa sipas radhës.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Rendi ka rëndësi: fillimisht "kush je?", pastaj "çfarë të lejohet?".
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
