var builder = WebApplication.CreateBuilder(args);

// Regjistrojmë shërbimet (çfarë "mjetesh" ka aplikacioni).
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Pipeline i kërkesave: çdo kërkesë kalon nëpër këto hapa sipas radhës.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
