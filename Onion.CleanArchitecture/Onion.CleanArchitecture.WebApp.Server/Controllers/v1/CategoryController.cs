using Casbin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onion.CleanArchitecture.Application.Features.Categories.Commands.CreateCategory;
using Onion.CleanArchitecture.Application.Features.Categories.Commands.DeleteCategoryById;
using Onion.CleanArchitecture.Application.Features.Categories.Commands.UpdateCategory;
using Onion.CleanArchitecture.Application.Features.Categories.Queries.GetAllCategories;
using Onion.CleanArchitecture.Application.Features.Categories.Queries.GetCategoryById;

namespace Onion.CleanArchitecture.WebApp.Server.Controllers.v1
{
    [Authorize]
    [Route("api/categories")]
    public class CategoryController : BaseApiController
    {
        public CategoryController(Enforcer enforcer) : base(enforcer)
        {
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAllCategoriesParameter filter)
        {
            return await EnforcePermissionAndExecute("categories", "list", async () =>
            {
                return Ok(await Mediator.Send(new GetAllCategoriesQuery()
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
            return await EnforcePermissionAndExecute("categories", "show", async () =>
            {
                return Ok(await Mediator.Send(new GetCategoryByIdQuery { Id = id }));
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreateCategoryCommand command)
        {
            return await EnforcePermissionAndExecute("categories", "create", async () =>
            {
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, UpdateCategoryCommand command)
        {
            return await EnforcePermissionAndExecute("categories", "edit", async () =>
            {
                if (id != command.Id)
                {
                    return BadRequest();
                }
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await EnforcePermissionAndExecute("categories", "delete", async () =>
            {
                return Ok(await Mediator.Send(new DeleteCategoryByIdCommand { Id = id }));
            });
        }
    }
}
