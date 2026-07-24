using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Onion.CleanArchitecture.Application.Interfaces;
using Onion.CleanArchitecture.Domain.Settings;
using Onion.CleanArchitecture.Infrastructure.Shared.Environments;
using Onion.CleanArchitecture.Infrastructure.Shared.Services;

namespace Onion.CleanArchitecture.Infrastructure.Shared
{
    public static class ServiceRegistration
    {
        public static void AddSharedInfrastructure(this IServiceCollection services, IConfiguration _config)
        {
            // Đăng ký cấu hình MailSettings từ tệp cấu hình (appsettings.json) vào dịch vụ DI, cho phép các lớp khác trong ứng dụng truy cập các thiết lập liên quan đến email thông qua IOptions<MailSettings>.
            services.Configure<MailSettings>(_config.GetSection("MailSettings"));
            services.Configure<RabbitMqOptions>(_config.GetSection("RabbitMq"));
            // Đăng ký dịch vụ IDateTimeService và IEmailService vào DI container, cho phép các lớp khác trong ứng dụng sử dụng các dịch vụ này thông qua dependency injection. IDateTimeService cung cấp các phương thức liên quan đến thời gian, trong khi IEmailService cung cấp các phương thức để gửi email.
            services.AddTransient<IDateTimeService, DateTimeService>();
            // Đăng ký dịch vụ IEmailService và EmailService vào DI container, cho phép các lớp khác trong ứng dụng sử dụng dịch vụ gửi email thông qua dependency injection. IEmailService là giao diện định nghĩa các phương thức gửi email, trong khi EmailService là triển khai cụ thể của giao diện này.
            services.AddTransient<IEmailService, EmailService>();
            // Đăng ký dịch vụ IRabbitMqSettingProdiver và RabbitMqSettingProdiver vào DI container, cho phép các lớp khác trong ứng dụng sử dụng dịch vụ này thông qua dependency injection. IRabbitMqSettingProdiver là giao diện định nghĩa các phương thức liên quan đến cấu hình RabbitMQ, trong khi RabbitMqSettingProdiver là triển khai cụ thể của giao diện này.
            services.AddSingleton<IRabbitMqSettingProdiver, RabbitMqSettingProdiver>();
        }
    }
}
