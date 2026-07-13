using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onion.CleanArchitecture.Application.Features.ConfigCategories.Commands.CreateConfigCategory;
using Onion.CleanArchitecture.Application.Features.ConfigCategories.Commands.DeleteConfigCategoryById;
using Onion.CleanArchitecture.Application.Features.ConfigCategories.Commands.UpdateConfigCategory;
using Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetAllConfigCategories;
using Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetConfigCategoryById;

namespace Onion.CleanArchitecture.WebApp.Server.Controllers.v1
{
    [Authorize]
    [Route("api/config-categories")]
    public class ConfigCategoryController : BaseApiController
    {
        [Obsolete]
        public ConfigCategoryController(
            Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment) : base(hostingEnvironment)
        {
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAllConfigCategoriesParameter filter)
        {
            return await EnforcePermissionAndExecute("config-categories", "list", async () =>
            {
                return Ok(await Mediator.Send(new GetAllConfigCategoriesQuery()
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
            return await EnforcePermissionAndExecute("config-categories", "show", async () =>
            {
                return Ok(await Mediator.Send(new GetConfigCategoryByIdQuery { Id = id }));
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreateConfigCategoryCommand command)
        {
            return await EnforcePermissionAndExecute("config-categories", "create", async () =>
            {
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, UpdateConfigCategoryCommand command)
        {
            return await EnforcePermissionAndExecute("config-categories", "edit", async () =>
            {
                if (id != command.Id) return BadRequest();
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await EnforcePermissionAndExecute("config-categories", "delete", async () =>
            {
                return Ok(await Mediator.Send(new DeleteConfigCategoryByIdCommand { Id = id }));
            });
        }
    }
}
