namespace Onion.CleanArchitecture.Domain.Settings
{
    /// <summary>
    /// Config kết nối RabbitMQ (Host, Port, Username, Password, VirtualHost) — dùng trong MassTransitRegistration và RabbitMqSettingProdiver
    /// </summary>
    public class RabbitMqOptions
    {
        public string Host { get; set; }
        public int Port { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string VirtualHost { get; set; }
        public ConsumerOptions Consumer { get; set; }
        public RetryOptions RetryPolicy { get; set; }
        public EndpointOptions Endpoints { get; set; }
    }

    /// <summary>
    /// Cấu hình consumer: PrefetchCount (số message lấy cùng lúc), TimeoutMinutes — dùng khi setup MassTransit receive endpoints
    /// </summary>

    public class ConsumerOptions
    {
        public ushort PrefetchCount { get; set; }
        public int TimeoutMinutes { get; set; }
    }

    /// <summary>
    /// Cấu hình retry policy: MaxRetryAttempts (số lần thử lại), InitialIntervalSeconds (khoảng cách giữa các lần retry) — dùng trong UseMessageRetry()
    /// </summary>

    public class RetryOptions
    {
        public int MaxRetryAttempts { get; set; }
        public int InitialIntervalSeconds { get; set; }
    }

    /// <summary>
    /// Định nghĩa tên queue/exchange: SagaQueue (cho saga state machine), JobConsumerQueue (cho job consumer), AuditLogQueue (cho audit log) — dùng để đặt tên queue khi configure endpoints
    /// </summary>
    public class EndpointOptions
    {
        public string PurchaseRequestExchange { get; set; }
        public string SagaQueue { get; set; }
        public string JobConsumerQueue { get; set; }
        public string AuditLogQueue { get; set; }
    }
}
