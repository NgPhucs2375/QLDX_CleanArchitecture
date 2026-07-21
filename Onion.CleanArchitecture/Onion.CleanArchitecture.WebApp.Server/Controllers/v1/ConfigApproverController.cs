using Casbin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onion.CleanArchitecture.Application.Features.ConfigApprovers.Commands.CreateConfigApprover;
using Onion.CleanArchitecture.Application.Features.ConfigApprovers.Commands.DeleteConfigApproverById;
using Onion.CleanArchitecture.Application.Features.ConfigApprovers.Commands.UpdateConfigApprover;
using Onion.CleanArchitecture.Application.Features.ConfigApprovers.Queries.GetAllConfigApprovers;
using Onion.CleanArchitecture.Application.Features.ConfigApprovers.Queries.GetConfigApproverById;

namespace Onion.CleanArchitecture.WebApp.Server.Controllers.v1
{
    [Authorize]
    [Route("api/config-approvers")]
    public class ConfigApproverController : BaseApiController
    {
        public ConfigApproverController(Enforcer enforcer) : base(enforcer)
        {
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAllConfigApproversParameter filter)
        {
            return await EnforcePermissionAndExecute("config-approvers", "list", async () =>
            {
                return Ok(await Mediator.Send(new GetAllConfigApproversQuery()
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
            return await EnforcePermissionAndExecute("config-approvers", "show", async () =>
            {
                return Ok(await Mediator.Send(new GetConfigApproverByIdQuery { Id = id }));
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreateConfigApproverCommand command)
        {
            return await EnforcePermissionAndExecute("config-approvers", "create", async () =>
            {
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, UpdateConfigApproverCommand command)
        {
            return await EnforcePermissionAndExecute("config-approvers", "edit", async () =>
            {
                if (id != command.Id) return BadRequest();
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await EnforcePermissionAndExecute("config-approvers", "delete", async () =>
            {
                return Ok(await Mediator.Send(new DeleteConfigApproverByIdCommand { Id = id }));
            });
        }
    }
}
