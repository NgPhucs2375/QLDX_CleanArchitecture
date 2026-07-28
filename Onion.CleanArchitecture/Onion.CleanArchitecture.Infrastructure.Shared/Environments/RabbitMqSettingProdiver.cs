using MassTransit;
using Microsoft.Extensions.Options;
using Onion.CleanArchitecture.Domain.Settings;
using RabbitMQ.Client;
using RabbitMQ.Client.Exceptions;
using System;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Infrastructure.Shared.Environments
{
    /// <summary>
    /// Lớp tiện ích cung cấp thông tin kết nối RabbitMQ(host,port,username,password) và các method kiểm tra 
    /// health check(IsHealthy) + gửi message trực tiếp tới queue(GetUri<T>)
    /// Thực chất là 1 Wrapper xung quanh RabbitMqOptions.
    /// </summary> 
    public class RabbitMqSettingProdiver : IRabbitMqSettingProdiver
    {
        // Tiêm vào để sài 
        private readonly RabbitMqOptions _options;
        public RabbitMqSettingProdiver(IOptions<RabbitMqOptions> options)
        {
            _options = options.Value;
        }
        // ánh xạ các thuộc tính từ RabbitMqOptions sang các phương thức của RabbitMqSettingProdiver để cung cấp thông tin kết nối RabbitMQ(host,port,username,password) và các method kiểm tra health check(IsHealthy) + gửi message trực tiếp tới queue(GetUri<T>)
        public ConnectionFactory GetConnectionFactory()
        {
            return new ConnectionFactory
            {
                HostName = _options.Host,
                Port = _options.Port,
                UserName = _options.Username,
                Password = _options.Password,
                VirtualHost = _options.VirtualHost
            };
        }

        // Tạo chuỗi kết nối RabbitMQ chuẩn
        public string GetConnectionString()
        {
            return $"amqp://{_options.Username}:{_options.Password}@{_options.Host}:{_options.Port}/{_options.VirtualHost}";
        }

        /// ===============[ => return nhanh để lấy về chuẩn giá trị dể hàm GetConnectionString có tài nguyên ghép nối nhanh hơn ]================
        public string GetHostName() => _options.Host;

        public string GetUserName() => _options.Username;

        public string GetPassword() => _options.Password;

        public string GetPort() => _options.Port.ToString();

        public string GetVHost() => _options.VirtualHost;

        /// <summary>
        /// Gửi message trực tiếp tới queue thông qua MassTransit IBus, sử dụng SendEndpoint để gửi message đến queue được chỉ định bởi queueName. Phương thức này giúp gửi message một cách trực tiếp và nhanh chóng mà không cần phải tạo consumer để nhận message.
        /// </summary>
        public async Task SendUri<T>(IBus bus, string queueName, T message)
        {
            // Đinh tuyến point to point đến hàng đợi cuối để định dạng endpoint 
            var uri = new Uri($"rabbitmq://{_options.Host}/{_options.VirtualHost}/{queueName}");
            // trung chuyển lập 1 cầu nối trỏ đúng vô cái uri ở trên 
            var endPoint = await bus.GetSendEndpoint(uri);
            // gửi message trực tiếp tới queue
            await endPoint.Send(message);
        }

        /// <summary>
        /// "ping" thử đến S RabbitMQ xem broker Islive? 
        /// </summary>
        public async Task<bool> IsHealthy()
        {
            try
            {
                // tạo biến hứng kết nối có các thông tin ở trên
                var connectionFactory = GetConnectionFactory();
                // using(...): khởi tạo kết nối (connection) và kênh giao tiếp(channel) using đảm bảo sau khi check xong ở } thì đóng hết lại và clear chống sập tài nguyên
                using (var connection = await connectionFactory.CreateConnectionAsync())
                using (var channel = await connection.CreateChannelAsync())
                {
                    return connection.IsOpen && channel.IsOpen;
                }
            }
            // BrokerUnreachableException : lỗi văng ra khi ứng dụng hoàn toàn không tìm thấy hoặc không thể thiết lập kết nối mạng tới Server RabbitMQ
            catch (BrokerUnreachableException)
            {
                return false;
            }
        }


    }
}
