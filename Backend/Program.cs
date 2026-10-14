using System.Text;
using System.Text.Json.Serialization;
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
builder.Services.AddSingleton<ImageFileService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<ReportService>();
builder.Services.AddScoped<CommentService>();
builder.Services.AddScoped<ImageService>();

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

// Enum-et shfaqen dhe pranohen si emra ("New"), jo si numra.
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
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

// CORS: lejon vetëm frontend-in tonë (adresat te appsettings, "Cors:AllowedOrigins"), jo të gjithë.
// Tokeni dërgohet te header-i Authorization, prandaj nuk na duhen cookie (pa AllowCredentials).
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod());
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

// CORS vjen para autentikimit: kërkesa "pyetëse" e shfletuesit (OPTIONS) nuk ka token.
app.UseCors("Frontend");

// Rendi ka rëndësi: fillimisht "kush je?", pastaj "çfarë të lejohet?".
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
