// Gửi cho :Trưởng đơn vị
// Nội dung :Phiếu đề xuất () với tổng tiền () đã được gửi đến bạn để duyệt
using System.Threading.Tasks;
using MassTransit;
using Microsoft.Extensions.Logging;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Application.Interfaces;

namespace Onion.CleanArchitecture.EmailService.Consumers
{
    /// <summary>
    /// Consumer để xử lý sự kiện khi một yêu cầu mua hàng được gửi và gửi email thông báo đến người phê duyệt
    /// </summary>
    /// IConsumer<!----><SendSubmittedEmailCommand> là một giao diện từ MassTransit, được sử dụng để định nghĩa một consumer cho lệnh SendSubmittedEmailCommand. Consumer này sẽ nhận thông điệp khi lệnh được phát ra và thực hiện các hành động cần thiết, trong trường hợp này là gửi email thông báo đến người phê duyệt.
    public class SendSubmittedEmailConsumer : IConsumer<SendSubmittedEmailCommand>
    {
        // là dịch vụ gửi email inject vào consumer để gửi email thông báo đến người phê duyệt khi một yêu cầu mua hàng được gửi.
        private readonly IEmailService _emailService;
        // là logger inject vào consumer để ghi lại các thông tin liên quan đến việc gửi email thông báo, giúp theo dõi và gỡ lỗi khi cần thiết.
        private readonly ILogger<SendSubmittedEmailConsumer> _logger;
        private readonly EmailDbContext _emailDB;

        // Constructor của SendSubmittedEmailConsumer nhận vào hai tham số: IEmailService và ILogger<SendSubmittedEmailConsumer>. IEmailService được sử dụng để gửi email thông báo đến người phê duyệt khi một yêu cầu mua hàng được gửi. ILogger<SendSubmittedEmailConsumer> được sử dụng để ghi lại các thông tin liên quan đến việc gửi email thông báo, giúp theo dõi và gỡ lỗi khi cần thiết.
        public SendSubmittedEmailConsumer(IEmailService emailService, ILogger<SendSubmittedEmailConsumer> logger, EmailDbContext emailDB)
        {
            _emailService = emailService;
            _logger = logger;
            _emailDB = emailDB;
        }

        // Consume là nơi xử lý logic khi nhận được sự kiện PurchaseRequestSubmittedEvent. Khi sự kiện này được phát ra, phương thức Consume sẽ được gọi và thực hiện các hành động cần thiết, trong trường hợp này là gửi email thông báo đến người phê duyệt.
        // đẩy tham số vào bằng ConsumeContext để tận dụng khả năng truy vết thông tin từ ngữ cảnh của sự kiện, chẳng hạn như các header, metadata, và các thông tin liên quan đến việc xử lý sự kiện. Điều này giúp consumer có thể truy cập và sử dụng các thông tin này một cách dễ dàng và hiệu quả.
        public async Task Consume(ConsumeContext<SendSubmittedEmailCommand> context)
        {
            var userEmail = await _emailDB.UserEmails.FindAsync(context.Message.RecipientId);
            if (userEmail == null)
            {
                _logger.LogWarning("Không tìm thấy thông tin email của user {UserId}, không thể gửi email", context.Message.SubmittedBy);
                return;
            }
            // khai báo và khởi tạo biến message để lưu trữ thông tin lệnh SendSubmittedEmailCommand nhận được từ ngữ cảnh của lệnh. Biến này sẽ được sử dụng để truy cập các thuộc tính của lệnh, chẳng hạn như RequestId, TotalAmount, SubmittedBy, và OccurredAt, nhằm thực hiện các hành động cần thiết, trong trường hợp này là gửi email thông báo đến người phê duyệt.
            var message = context.Message;

            // ghi lại log thông tin về việc gửi email thông báo cho yêu cầu mua hàng đã được gửi, bao gồm RequestId và SubmittedBy. Điều này giúp theo dõi và gỡ lỗi khi cần thiết.
            _logger.LogInformation(
                "Email thông báo yêu cầu phiếu đề xuất đã được gửi đến người phê duyệt cho yêu cầu mua hàng với ID: {RequestId} và được tạo bởi: {SubmittedBy}",
                message.RequestId, message.SubmittedBy);

            // Tạo 1 đối tượng để lưu trữ thông tin email cần gửi, với định dạng là dto từ email với thuộc tính trong email request đó .
            var emailRequest = new Application.DTOs.Email.EmailRequest
            {
                // Địa chỉ người nhận 
                To = userEmail.Email,
                // Tiều đề email thông báo 
                Subject = $"Phiếu đề xuất #{message.RequestId} Cần Phê Duyệt",
                // Nội dung email thông báo
                Body = $"1 Phiếu đề xuất mới (ID: {message.RequestId}) với tổng tiền {message.TotalAmount:C} đã được gửi đến bạn để phê duyệt."
            };

            // gọi promise để gửi email thông báo đến người phê duyệt với thông tin email đã được tạo ở trên. Phương thức SendAsync sẽ thực hiện việc gửi email và trả về một Task, cho phép phương thức Consume tiếp tục thực hiện các hành động khác mà không bị chặn.
            await _emailService.SendAsync(emailRequest);
        }
    }
}
