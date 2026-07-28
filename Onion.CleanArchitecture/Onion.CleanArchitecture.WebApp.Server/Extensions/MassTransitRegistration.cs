using MassTransit;
using MassTransit.EntityFrameworkCoreIntegration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Messaging.Activities;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;
using Onion.CleanArchitecture.Infrastructure.Shared.Services;
using Onion.CleanArchitecture.WebApp.Server.Consumers;

namespace Onion.CleanArchitecture.WebApp.Server.Extensions
{
    public static class MassTransitRegistration
    {
        public static IServiceCollection AddMessageBus(this IServiceCollection services, IConfiguration config)
        {
            services.AddMassTransit(x =>
            {
                x.AddConsumer<RequestUserSyncConsumer>();

                x.AddSagaStateMachine<PurchaseRequestSagaStateMachine, PurchaseRequestSaga>()
                    .EntityFrameworkRepository(r =>
                    {
                        r.ConcurrencyMode = ConcurrencyMode.Optimistic;
                        r.ExistingDbContext<Onion.CleanArchitecture.Infrastructure.Persistence.Contexts.SagaDbContext>();
                    });

                x.UsingRabbitMq((context, cfg) =>
                {
                    var options = context.GetRequiredService<IOptions<RabbitMqOptions>>().Value;

                    cfg.Host(options.Host, (ushort)options.Port, options.VirtualHost, h =>
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
            services.Configure<QueueSetting>(config.GetSection("QueueSetting"));
            services.AddTransient<IEventBusService, MassTransitEventBusServices>();

            // Saga activities (đăng ký để MassTransit resolve khi saga gọi .Activity())
            services.AddScoped<OnSubmittedActivity>();
            services.AddScoped<OnDepartmentApprovedActivity>();
            services.AddScoped<OnDepartmentRejectedActivity>();
            services.AddScoped<OnControlApprovedActivity>();
            services.AddScoped<OnControlRejectedActivity>();
            services.AddScoped<OnReturnedForEditActivity>();
            services.AddScoped<OnOrderConfirmedActivity>();

            return services;
        }
    }
}
