using System.Text;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.NotificationService.Consumers;
using Onion.CleanArchitecture.NotificationService.Hubs;
using Onion.CleanArchitecture.NotificationService.Interceptors;
using Onion.CleanArchitecture.NotificationService.Services;

var builder = WebApplication.CreateBuilder(args);

// ============= CONFIG =============
builder.Services.Configure<RabbitMqOptions>(
    builder.Configuration.GetSection("RabbitMqOptions"));

builder.Services.Configure<JWTSettings>(
    builder.Configuration.GetSection("JWTSettings"));

// ============= AUTH (JWT) =============
var jwtSettings = builder.Configuration.GetSection("JWTSettings").Get<JWTSettings>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Key))
        };

        // Cho phép SignalR nhận token từ query string ?access_token=xxx
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var accessToken = ctx.Request.Query["access_token"];
                var path = ctx.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notification-hub"))
                {
                    ctx.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.Configure<QueueSetting>(builder.Configuration.GetSection("QueueSettings"));

builder.Services.AddAuthorization();

// ============= SIGNALR =============
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, JwtUserIdProvider>();

// ============= MASS TRANSIT =============
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<NotifyApproverConsumer>();
    x.AddConsumer<NotifyDepartmentApprovedConsumer>();
    x.AddConsumer<NotifyDepartmentRejectedConsumer>();
    x.AddConsumer<NotifyControlApprovedConsumer>();
    x.AddConsumer<NotifyControlRejectedConsumer>();
    x.AddConsumer<NotifyReturnedForEditConsumer>();
    x.AddConsumer<NotifyOrderConfirmedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var options = context.GetRequiredService<IOptions<RabbitMqOptions>>().Value;
        var queues = context.GetRequiredService<IOptions<QueueSetting>>().Value;
        cfg.Host(options.Host, (ushort)options.Port, options.VirtualHost, h =>
        {
            h.Username(options.Username);
            h.Password(options.Password);
        });

        cfg.ReceiveEndpoint(queues.NotifyApprover, e => e.ConfigureConsumer<NotifyApproverConsumer>(context));
        cfg.ReceiveEndpoint(queues.NotifyApproverByDepartment, e => e.ConfigureConsumer<NotifyDepartmentApprovedConsumer>(context));
        cfg.ReceiveEndpoint(queues.NotifyRejectedByDepartment, e => e.ConfigureConsumer<NotifyDepartmentRejectedConsumer>(context));
        cfg.ReceiveEndpoint(queues.NotifyApproverByControl, e =>
        {
            e.ConfigureConsumer<NotifyControlApprovedConsumer>(context);
            e.ConfigureConsumer<NotifyControlRejectedConsumer>(context);
        });
        cfg.ReceiveEndpoint(queues.NotifyReturnedForEdit, e => e.ConfigureConsumer<NotifyReturnedForEditConsumer>(context));
        cfg.ReceiveEndpoint(queues.NotifyOrderConfirmed, e => e.ConfigureConsumer<NotifyOrderConfirmedConsumer>(context));
    });
});


// ============= STORE + CORS =============
builder.Services.AddSingleton<INotificationStore, InMemoryNotificationStore>();

builder.Services.AddCors(o => o.AddPolicy("AllowClient", p =>
    p.WithOrigins("http://localhost:3000", "https://localhost:7126")
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials()));

var app = builder.Build();

app.UseCors("AllowClient");
app.UseAuthentication();
app.UseAuthorization();

app.MapHub<NotificationHub>("/notification-hub");

app.Run();
