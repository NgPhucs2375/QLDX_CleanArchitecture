using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.CreatePurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.DeletePurchaseRequestById;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.UpdatePurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetAllPurchaseRequests;
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
    }
}
