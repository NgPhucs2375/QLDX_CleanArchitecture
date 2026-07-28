using AutoMapper;
using Casbin.Config;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Onion.CleanArchitecture.Application.Behaviours;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Services;
using Onion.CleanArchitecture.Domain.Settings;
using System.Reflection;

namespace Onion.CleanArchitecture.Application
{
    public static class ServiceExtensions
    {
        public static void AddApplicationLayer(this IServiceCollection services)
        {
            // services này bảo MediatR "Quét all Assembly Application, tìm class nào implement IRequestHandler<TRequest,TResponse> thì tự đăng ký nó vào DI. " 
            // nó tìm thấy TriggerPurchaseRequestCommandHandler 
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(Assembly.GetExecutingAssembly()));
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
            services.AddAutoMapper(cfg => cfg.AddMaps(Assembly.GetExecutingAssembly()));
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            services.AddTransient<RecalculateTotalsService>();
            services.AddTransient<IApprovalRecordService, ApprovalRecordService>();
            services.AddTransient<IPurchaseRequestWorkflowService, PurchaseRequestWorkflowService>();
            services.AddTransient<IRecalculateTotalsService, RecalculateTotalsService>();
        }
    }
}
