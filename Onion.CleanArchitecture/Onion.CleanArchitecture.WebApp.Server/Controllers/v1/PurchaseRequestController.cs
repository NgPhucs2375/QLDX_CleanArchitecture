using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.ApproveDepartmentPurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.ApprovePurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.CompletePurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.ConfirmOrderPurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.CreatePurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.DeletePurchaseRequestById;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.RejectPurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.ReturnForEditPurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.SubmitPurchaseRequest;
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

        [HttpPost("{id}/submit")]
        public async Task<IActionResult> Submit(int id)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "submit", async () =>
            {
                return Ok(await Mediator.Send(new SubmitPurchaseRequestCommand { Id = id }));
            });
        }

        [HttpPost("{id}/approve-department")]
        public async Task<IActionResult> ApproveDepartment(int id)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "approve-department", async () =>
            {
                return Ok(await Mediator.Send(new ApproveDepartmentPurchaseRequestCommand { Id = id }));
            });
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "reject", async () =>
            {
                return Ok(await Mediator.Send(new RejectPurchaseRequestCommand { Id = id }));
            });
        }

        [HttpPost("{id}/return-for-edit")]
        public async Task<IActionResult> ReturnForEdit(int id)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "return-for-edit", async () =>
            {
                return Ok(await Mediator.Send(new ReturnForEditPurchaseRequestCommand { Id = id }));
            });
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "approve", async () =>
            {
                return Ok(await Mediator.Send(new ApprovePurchaseRequestCommand { Id = id }));
            });
        }

        [HttpPost("{id}/confirm-order")]
        public async Task<IActionResult> ConfirmOrder(int id)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "confirm-order", async () =>
            {
                return Ok(await Mediator.Send(new ConfirmOrderPurchaseRequestCommand { Id = id }));
            });
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> Complete(int id)
        {
            return await EnforcePermissionAndExecute("purchase-requests", "complete", async () =>
            {
                return Ok(await Mediator.Send(new CompletePurchaseRequestCommand { Id = id }));
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
