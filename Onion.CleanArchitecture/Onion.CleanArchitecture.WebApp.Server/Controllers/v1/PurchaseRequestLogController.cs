using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Commands.CreatePurchaseRequestLog;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Commands.DeletePurchaseRequestLogById;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Commands.UpdatePurchaseRequestLog;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Queries.GetAllPurchaseRequestLogs;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Queries.GetPurchaseRequestLogById;

namespace Onion.CleanArchitecture.WebApp.Server.Controllers.v1
{
    [Authorize]
    [Route("api/purchase-request-logs")]
    public class PurchaseRequestLogController : BaseApiController
    {
        [Obsolete]
        public PurchaseRequestLogController(
            Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment) : base(hostingEnvironment)
        {
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAllPurchaseRequestLogsParameter filter)
        {
            return await EnforcePermissionAndExecute("purchase-request-logs", "list", async () =>
            {
                return Ok(await Mediator.Send(new GetAllPurchaseRequestLogsQuery()
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
            return await EnforcePermissionAndExecute("purchase-request-logs", "show", async () =>
            {
                return Ok(await Mediator.Send(new GetPurchaseRequestLogByIdQuery { Id = id }));
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreatePurchaseRequestLogCommand command)
        {
            return await EnforcePermissionAndExecute("purchase-request-logs", "create", async () =>
            {
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, UpdatePurchaseRequestLogCommand command)
        {
            return await EnforcePermissionAndExecute("purchase-request-logs", "edit", async () =>
            {
                if (id != command.Id) return BadRequest();
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await EnforcePermissionAndExecute("purchase-request-logs", "delete", async () =>
            {
                return Ok(await Mediator.Send(new DeletePurchaseRequestLogByIdCommand { Id = id }));
            });
        }
    }
}
