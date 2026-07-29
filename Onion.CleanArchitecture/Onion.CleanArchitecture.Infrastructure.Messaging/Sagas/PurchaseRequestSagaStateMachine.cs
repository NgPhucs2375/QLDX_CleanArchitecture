using MassTransit;
using Onion.CleanArchitecture.Application.Contracts;
using Onion.CleanArchitecture.Infrastructure.Messaging.Activities;

namespace Onion.CleanArchitecture.Infrastructure.Messaging.Sagas
{
    public class PurchaseRequestSagaStateMachine :
        MassTransitStateMachine<PurchaseRequestSaga>
    {
        public State Submitted { get; private set; } = null!;
        public State PendingDepartment { get; private set; } = null!;
        public State PendingControl { get; private set; } = null!;
        public State PendingOrderConfirm { get; private set; } = null!;
        public State Completed { get; private set; } = null!;
        public State RejectedDepartment { get; private set; } = null!;
        public State RejectedControl { get; private set; } = null!;
        public State ReturnedForEdit { get; private set; } = null!;

        public Event<PurchaseRequestSubmittedEvent> RequestSubmitted { get; private set; }
        public Event<PurchaseRequestDepartmentApprovedEvent> RequestDepartmentApproved { get; private set; }
        public Event<PurchaseRequestDepartmentRejectedEvent> RequestDepartmentRejected { get; private set; }
        public Event<PurchaseRequestControlApprovedEvent> RequestControlApproved { get; private set; }
        public Event<PurchaseRequestControlRejectedEvent> RequestControlRejected { get; private set; }
        public Event<PurchaseRequestReturnedForEditEvent> RequestReturnedForEdit { get; private set; }
        public Event<PurchaseRequestOrderConfirmedEvent> RequestOrderConfirmed { get; private set; }


        //  SetCompletedWhenFinalized(); // xóa bản ghi khi xong flow
        //  Dùng khi muốn nhẹ nhàng, không muốn lưu lại bản ghi khi flow kết thúc. Nhưng nếu muốn lưu lại để thống kê thì không nên dùng.

        public PurchaseRequestSagaStateMachine()
        {
            // ======== STATE MACHINE CONFIGURATION ========
            InstanceState(x => x.CurrentState);

            // ======== TRANSITION LOGIC ========

            Initially(
                // Khi saga đang ở trạng thái initially và sự kiện RequestSubmitted xảy ra thì hãy thực hiện các hành động tiếp theo (VD: Then,Activity,TransitionTo,...)
                When(RequestSubmitted)
                    // Then: dùng cho các action simple,đồng bộ, và thực hiện ngay trong state machine thường để cập nhật trạng thái của chính saga
                    .Then(ctx =>
                    {
                        ctx.Saga.RequestId = ctx.Message.RequestId;
                        ctx.Saga.TotalAmount = ctx.Message.TotalAmount;
                        ctx.Saga.CreatedBy = ctx.Message.SubmittedBy;
                        ctx.Saga.CreatedAt = DateTime.UtcNow;
                    })
                    // Activity: Dùng cho các hành động phức tạp hơn,có thể bất đồng bộ, và được tách ra một lớp riêng thường là để thực hiện các tác vụ phụ(side-effects) như gọi API,gửi email, or tương tác với các dịch vụ khác
                    .Activity(x => x.OfType<OnSubmittedActivity>())
                    .TransitionTo(PendingDepartment)
            );

            During(PendingDepartment,
                When(RequestDepartmentApproved)
                    .Activity(x=> x.OfType<OnDepartmentApprovedActivity>())
                    .TransitionTo(PendingControl),
                When(RequestDepartmentRejected)
                    .Activity(x=> x.OfType<OnDepartmentRejectedActivity>())
                    .TransitionTo(RejectedDepartment)
                    );

            During(PendingControl,
                When(RequestControlApproved)
                    .Activity(x=> x.OfType<OnControlApprovedActivity>())
                    .TransitionTo(PendingOrderConfirm),
                When(RequestControlRejected)
                    .Activity(x=> x.OfType<OnControlRejectedActivity>())
                    .TransitionTo(RejectedControl),
                When(RequestReturnedForEdit)
                    .Activity(x=> x.OfType<OnReturnedForEditActivity>())
                    .TransitionTo(ReturnedForEdit)
            );

            During(PendingOrderConfirm,
                When(RequestOrderConfirmed)
                    .Then(ctx => ctx.Saga.CompletedAt = DateTime.UtcNow)
                    .Activity(x => x.OfType<OnOrderConfirmedActivity>())
                    .TransitionTo(Completed)
                    );

            During(ReturnedForEdit,
                When(RequestSubmitted)
                    .Then(ctx =>
                    {
                        ctx.Saga.TotalAmount = ctx.Message.TotalAmount;
                        ctx.Saga.CreatedBy = ctx.Message.SubmittedBy;
                    })
                    .Activity(x => x.OfType<OnSubmittedActivity>())
                    .TransitionTo(PendingDepartment)
                   );

            // ======== CORRELATION ========
            // e.CorrelateBy
            // Xác định tìm đúng saga instance để xử lý sự kiện
            // Cách hoạt động : CorrelateBy ra lệnh cho MAT thực hiện 1 query vào csdl PurchaseRequestSaga
            // Nó so sánh giá trị RequestId của các saga instance(saga.RequestId) với giá trị RequestId trong thông điệp vừa nhận được (context.Message.RequestId)
            // Nếu tìm thấy một saga instance có RequestId trùng khớp, thông điệp này sẽ được gửi đến saga instance đó để xử lý.

            //e.SelectId
            //Chỉ định cách tạo một saga instance mới nếu CorrelateBy không tìm thấy instance nào phù hợp.
            //Cách hoạt động : SelectId chỉ được thực thi khi không có saga nào khớp với điều kiện trong CorrelateBy.Điều này thường xảy ra khi một phiếu đề xuất được tạo và gửi đi lần đầu tiên
            //Nó chỉ định rằng CorrelationId(PK của instance) sẽ được lấy trực tiếp từ CorrelateId của thông điệp(context.Message.CorrlationId)
            Event(() => RequestSubmitted, e =>
            {
                //Tìm saga instance đã tồn tại
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                //Nếu chưa tồn tại tạo instance mới
                e.SelectId(context => context.Message.CorrelationId);
            });

            Event(() => RequestDepartmentApproved, e =>{
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m=> m.ExecuteAsync(async context =>
                  await Console.Out.WriteLineAsync($"[SAGA-WARN] đã nhận phê duyệt phiếu đề xuất {context.Message.RequestId} nhưng không tìm thấy saga instance nào để xử lý. Có thể phiếu đề xuất đã bị xóa hoặc chưa được tạo.")));
            });
            

            Event(() => RequestDepartmentRejected, e =>{
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m=> m.ExecuteAsync(async context =>
                  await Console.Out.WriteLineAsync($"[SAGA-WARN] đã nhận từ chối phê duyệt phiếu đề xuất {context.Message.RequestId} nhưng không tìm thấy saga instance nào để xử lý. Có thể phiếu đề xuất đã bị xóa hoặc chưa được tạo.")));

                });

            Event(() => RequestControlApproved, e =>{
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m=> m.ExecuteAsync(async context =>
                  await Console.Out.WriteLineAsync($"[SAGA-WARN] đã nhận duyệt phê duyệt phiếu đề xuất {context.Message.RequestId} nhưng không tìm thấy saga instance nào để xử lý. Có thể phiếu đề xuất đã bị xóa hoặc chưa được tạo.")));

                });

            Event(() => RequestControlRejected, e =>{
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m=> m.ExecuteAsync(async context =>
                  await Console.Out.WriteLineAsync($"[SAGA-WARN] đã nhận từ chối phê duyệt phiếu đề xuất {context.Message.RequestId} nhưng không tìm thấy saga instance nào để xử lý. Có thể phiếu đề xuất đã bị xóa hoặc chưa được tạo.")));

                });

            Event(() => RequestReturnedForEdit, e =>{
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m=> m.ExecuteAsync(async context =>
                  await Console.Out.WriteLineAsync($"[SAGA-WARN] đã nhận phiếu đề xuất {context.Message.RequestId} nhưng không tìm thấy saga instance nào để xử lý. Có thể phiếu đề xuất đã bị xóa hoặc chưa được tạo.")));
            });

            Event(() => RequestOrderConfirmed, e =>{
                e.CorrelateBy((saga, context) => saga.RequestId == context.Message.RequestId);
                e.OnMissingInstance(m=> m.ExecuteAsync(async context =>
                  await Console.Out.WriteLineAsync($"[SAGA-WARN] đã nhận xác nhận đặt hàng phiếu đề xuất {context.Message.RequestId} nhưng không tìm thấy saga instance nào để xử lý. Có thể phiếu đề xuất đã bị xóa hoặc chưa được tạo.")));
            });
        }
    }
}