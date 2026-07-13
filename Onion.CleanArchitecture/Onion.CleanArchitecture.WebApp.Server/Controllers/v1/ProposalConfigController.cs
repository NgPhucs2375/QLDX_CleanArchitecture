using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onion.CleanArchitecture.Application.Features.ProposalConfigs.Commands.CreateProposalConfig;
using Onion.CleanArchitecture.Application.Features.ProposalConfigs.Commands.DeleteProposalConfigById;
using Onion.CleanArchitecture.Application.Features.ProposalConfigs.Commands.UpdateProposalConfig;
using Onion.CleanArchitecture.Application.Features.ProposalConfigs.Queries.GetAllProposalConfigs;
using Onion.CleanArchitecture.Application.Features.ProposalConfigs.Queries.GetProposalConfigById;

namespace Onion.CleanArchitecture.WebApp.Server.Controllers.v1
{
    [Authorize]
    [Route("api/proposal-configs")]
    public class ProposalConfigController : BaseApiController
    {
        [Obsolete]
        public ProposalConfigController(
            Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment) : base(hostingEnvironment)
        {
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAllProposalConfigsParameter filter)
        {
            return await EnforcePermissionAndExecute("proposal-configs", "list", async () =>
            {
                return Ok(await Mediator.Send(new GetAllProposalConfigsQuery()
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
            return await EnforcePermissionAndExecute("proposal-configs", "show", async () =>
            {
                return Ok(await Mediator.Send(new GetProposalConfigByIdQuery { Id = id }));
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreateProposalConfigCommand command)
        {
            return await EnforcePermissionAndExecute("proposal-configs", "create", async () =>
            {
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, UpdateProposalConfigCommand command)
        {
            return await EnforcePermissionAndExecute("proposal-configs", "edit", async () =>
            {
                if (id != command.Id) return BadRequest();
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await EnforcePermissionAndExecute("proposal-configs", "delete", async () =>
            {
                return Ok(await Mediator.Send(new DeleteProposalConfigByIdCommand { Id = id }));
            });
        }
    }
}
