using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.CreatePurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.DeletePurchaseRequestById;

using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.TriggerPurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.UpdatePurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetAllPurchaseRequests;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetCascadeCreateData;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetPurchaseRequestById;

namespace Onion.CleanArchitecture.WebApp.Server.Controllers.v1
{
    [Authorize]
    [Route("api/purchase-requests")]
    public class PurchaseRequestController : BaseApiController
    {
        [Obsolete]
        public PurchaseRequestController(
            Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment) : base(hostingEnvironment)
        {
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAllPurchaseRequestsParameter filter)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "list", async () =>
            {
                return Ok(await Mediator.Send(new GetAllPurchaseRequestsQuery()
                {
                    _end = filter._end,
                    _start = filter._start,
                    _order = filter._order,
                    _sort = filter._sort,
                    _filter = filter._filter
                }));
            });
        }

        [HttpGet("show/{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "show", async () =>
            {
                return Ok(await Mediator.Send(new GetPurchaseRequestByIdQuery { Id = id }));
            });
        }

        [HttpGet("cascade-create")]
        public async Task<IActionResult> GetCascadeCreateData([FromQuery] GetCascadeCreateDataQuery query)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "create", async () =>
            {
                return Ok(await Mediator.Send(query));
            });
        }

        [HttpGet("cascade-products")]
        public async Task<IActionResult> GetCascadeProducts([FromQuery] GetCascadeProductsQuery query)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "create", async () =>
            {
                return Ok(await Mediator.Send(query));
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreatePurchaseRequestCommand command)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "create", async () =>
            {
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, UpdatePurchaseRequestCommand command)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "edit", async () =>
            {
                if (id != command.Id) return BadRequest();
                return Ok(await Mediator.Send(command));
            });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "delete", async () =>
            {
                return Ok(await Mediator.Send(new DeletePurchaseRequestByIdCommand { Id = id }));
            });
        }

        //Attribute dung de router
        [HttpPost("{id}/trigger")]
        // IActionResult : kết quả phải trả về se là 1 mã trạng thhasi HTTP(vd: 200 OK, 400 EROR, 403 FORBIDDEN, 404 NOT FOUND, 500 INTERNAL SERVER ERROR)
        public async Task<IActionResult> Trigger(int id,TriggerPurchaseRequestCommand command)
        {
            // nếu id của url không giống id của tờ giấy ghhi thhif trả về 400 - Yêu cầu khhoong hhopj lệ
            if(id != command.Id) return BadRequest();
            // Lớp thuhws nhhast: Phhana quyền (ÈnorcePermissionAndExecute) thhy vì 1 mớ code lộn xộn bằng các vòn lặp if/else để
            // check xem người dùng hiện tại có quyên thuhwjc hhienej hhanfh động "trigger" trên module"pủchhae-request" hay khhoong . toàn bộ logic đó đã đã dược gói gọn vào 1 hà dùng chuhng

            // Lớp thuhws hai : Giao việc (async () => OK(await Mediator.Send(command))) nếu bước kiêm tra permission thhnahfh côngg :
            // Mediator.Send(command): lễ tân khohong tụ tay xử lý nghhieepj cụ mà đưa "order" chho quản lý MediatR. Từ đây MediatR se tự biết tìm đếnn đúng TriggerurchahseRequeestCommaHandler (Người đâu bếp) dể xử lý
            // OK(): Khi đầu bếp cook và trả về kết quả (Response<int>)hàm OK(sẽ đóng gói kết quả đó vào 1gois quà mang mã tragnj tháo HHTTP 200 dể trả về chho kahshc)
            return await EnforcePermissionAndExecute("purchase-requests","trigger",async () =>
            Ok(await Mediator.Send(command)));
        }
    }
}
