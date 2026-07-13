using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Commands.CreatePurchaseRequestCategory;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Commands.DeletePurchaseRequestCategoryById;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Commands.UpdatePurchaseRequestCategory;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Queries.GetAllPurchaseRequestCategories;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Queries.GetPurchaseRequestCategoryById;

namespace Onion.CleanArchitecture.WebApp.Server.Controllers.v1
{
    [Authorize]
    [Route("api/purchase-request-categories")]
    public class PurchaseRequestCategoryController : BaseApiController
    {
        [Obsolete]
        public PurchaseRequestCategoryController(
            Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment) : base(hostingEnvironment)
        {
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAllPurchaseRequestCategoriesParameter filter)
        {
            return await EnforcePermissionAndExecute("purchase-request-categories", "list", async () =>
            {
                return Ok(await Mediator.Send(new GetAllPurchaseRequestCategoriesQuery()
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
            return await EnforcePermissionAndExecute("purchase-request-categories", "show", async () =>
            {
                return Ok(await Mediator.Send(new GetPurchaseRequestCategoryByIdQuery { Id = id }));
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreatePurchaseRequestCategoryCommand command)
        {
            return await EnforcePermissionAndExecute("purchase-request-categories", "create", async () =>
            {
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, UpdatePurchaseRequestCategoryCommand command)
        {
            return await EnforcePermissionAndExecute("purchase-request-categories", "edit", async () =>
            {
                if (id != command.Id) return BadRequest();
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await EnforcePermissionAndExecute("purchase-request-categories", "delete", async () =>
            {
                return Ok(await Mediator.Send(new DeletePurchaseRequestCategoryByIdCommand { Id = id }));
            });
        }
    }
}
