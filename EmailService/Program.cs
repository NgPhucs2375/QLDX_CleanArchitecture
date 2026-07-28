using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Onion.CleanArchitecture.EmailService.Consumers;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Shared.Services;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Onion.CleanArchitecture.EmailService.Data;
using Onion.CleanArchitecture.EmailService.Services;

var host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((ctx, services) =>
    {
        services.Configure<RabbitMqOptions>(
            ctx.Configuration.GetSection("RabbitMqOptions"));
        services.Configure<MailSettings>(ctx.Configuration.GetSection("MailSettings"));

        services.AddMassTransit(x =>
        {
            x.AddConsumer<SendSubmittedEmailConsumer>();
            x.AddConsumer<SendDepartmentApprovedEmailConsumer>();
            x.AddConsumer<SendDepartmentRejectedEmailConsumer>();
            x.AddConsumer<SendControlApprovedEmailConsumer>();
            x.AddConsumer<SendControlRejectedEmailConsumer>();
            x.AddConsumer<SendReturnedForEditEmailConsumer>();
            x.AddConsumer<SendOrderConfirmEmailConsumer>();
            x.AddConsumer<AuditLogConsumer>();
            x.AddConsumer<UserEmailSyncConsumer>();

            x.UsingRabbitMq((context, cfg) =>
            {
                var options = context.GetRequiredService<Microsoft.Extensions.Options.IOptions<RabbitMqOptions>>().Value;
                var queues = context.GetRequiredService<IOptions<QueueSetting>>().Value;
                cfg.Host(options.Host, (ushort)options.Port, options.VirtualHost, h =>
                {
                    h.Username(options.Username);
                    h.Password(options.Password);
                });

                cfg.ReceiveEndpoint(queues.EmailSubmitted, e => e.ConfigureConsumer<SendSubmittedEmailConsumer>(context));
                cfg.ReceiveEndpoint(queues.EmailDepartmentApproved, e => e.ConfigureConsumer<SendDepartmentApprovedEmailConsumer>(context));
                cfg.ReceiveEndpoint(queues.EmailDepartmentRejected, e => e.ConfigureConsumer<SendDepartmentRejectedEmailConsumer>(context));
                cfg.ReceiveEndpoint(queues.EmailControlApproved, e => e.ConfigureConsumer<SendControlApprovedEmailConsumer>(context));
                cfg.ReceiveEndpoint(queues.NotifyRejectedByControl, e => e.ConfigureConsumer<SendControlRejectedEmailConsumer>(context));
                cfg.ReceiveEndpoint(queues.EmailReturnedForEdit, e => e.ConfigureConsumer<SendReturnedForEditEmailConsumer>(context));
                cfg.ReceiveEndpoint(queues.EmailOrderConfirmed, e => e.ConfigureConsumer<SendOrderConfirmEmailConsumer>(context));
                cfg.ReceiveEndpoint(queues.EmailAudit, e => e.ConfigureConsumer<AuditLogConsumer>(context));
                cfg.ReceiveEndpoint(queues.UserEmailSync, e => e.ConfigureConsumer<UserEmailSyncConsumer>(context));
                
            });
        });

        services.Configure<QueueSetting>(ctx.Configuration.GetSection("QueueSettings"));
        services.AddTransient<IEmailService, Onion.CleanArchitecture.Infrastructure.Shared.Services.EmailService>();
        services.AddDbContext<EmailDbContext>(options =>
            options.UseNpgsql(ctx.Configuration.GetConnectionString("EmailDb")));
        services.AddHostedService<StartupSyncService>();
    })
    .Build();

await host.RunAsync();