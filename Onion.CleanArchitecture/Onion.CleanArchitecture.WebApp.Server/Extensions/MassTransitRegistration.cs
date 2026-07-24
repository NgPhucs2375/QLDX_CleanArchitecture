using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Consumers;
using Onion.CleanArchitecture.Infrastructure.Shared.Services;

namespace Onion.CleanArchitecture.WebApp.Server.Extensions
{
    public static class MassTransitRegistration
    {
        public static IServiceCollection AddMessageBus(this IServiceCollection services, IConfiguration config)
        {
            services.AddMassTransit(x =>
            {
                x.AddConsumer<SendApprovalEmailConsumer>();

                x.UsingRabbitMq((context, cfg) =>
                {
                    var options = context.GetRequiredService<IOptions<RabbitMqOptions>>().Value;

                    cfg.Host(options.Host, options.Port, options.VirtualHost, h =>
                    {
                        h.Username(options.Username);
                        h.Password(options.Password);
                    });

                    cfg.UseMessageRetry(r => r.Interval(
                        options.RetryPolicy.MaxRetryAttempts,
                        TimeSpan.FromSeconds(options.RetryPolicy.InitialIntervalSeconds)));

                    cfg.PrefetchCount = options.Consumer.PrefetchCount;

                    cfg.UseInMemoryOutbox(context);
                    cfg.ConfigureEndpoints(context);
                });
            });

            services.AddTransient<IEventBusService, MassTransitEventBusServices>();
            return services;
        }
    }
}
