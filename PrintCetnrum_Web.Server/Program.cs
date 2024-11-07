using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using PrintCetnrum_Web.Server.Context;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(option => 
    option.AddPolicy("MyPolicy", builder => 
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));


builder.Services.AddDbContext<AppDbContext>(option =>
{
    //option.UseSqlServer(builder.Configuration.GetConnectionString("SQLServer"));
    option.UseSqlServer(builder.Configuration.GetConnectionString("SqlServerConnStr"));
});


var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("MyPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
