using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.CreatePurchaseRequestItem;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.DeletePurchaseRequestItemById;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.UpdatePurchaseRequestItem;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.UpdateActualQuantity;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Queries.GetAllPurchaseRequestItems;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Queries.GetPurchaseRequestItemById;
using Casbin;

namespace Onion.CleanArchitecture.WebApp.Server.Controllers.v1
{
    [Authorize]
    [Route("api/purchase-request-items")]
    public class PurchaseRequestItemController : BaseApiController
    {
        public PurchaseRequestItemController(Enforcer enforcer) : base(enforcer)
        {
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAllPurchaseRequestItemsParameter filter)
        {
            return await EnforcePermissionAndExecute("purchase-request-items", "list", async () =>
            {
                return Ok(await Mediator.Send(new GetAllPurchaseRequestItemsQuery()
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
            return await EnforcePermissionAndExecute("purchase-request-items", "show", async () =>
            {
                return Ok(await Mediator.Send(new GetPurchaseRequestItemByIdQuery { Id = id }));
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreatePurchaseRequestItemCommand command)
        {
            return await EnforcePermissionAndExecute("purchase-request-items", "create", async () =>
            {
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, UpdatePurchaseRequestItemCommand command)
        {
            return await EnforcePermissionAndExecute("purchase-request-items", "edit", async () =>
            {
                if (id != command.Id) return BadRequest();
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await EnforcePermissionAndExecute("purchase-request-items", "delete", async () =>
            {
                return Ok(await Mediator.Send(new DeletePurchaseRequestItemByIdCommand { Id = id }));
            });
        }

        [HttpPut("{id}/update-actual-quantity")]
        public async Task<IActionResult> UpdateActualQuantity(int id,UpdateActualQuantityCommand command)
        {
            // tra ve promise de xu ly async, neu khong tra ve promise se bi loi 500
            // check permission gom : string resource, string action, Func<Task<IActionResult>> execute
            return await EnforcePermissionAndExecute("purchase-request-items","update-actual-quantity",async () => {
                if(id != command.Id) return BadRequest();
                return Ok(await Mediator.Send(command));
            });
        }
    }
}
