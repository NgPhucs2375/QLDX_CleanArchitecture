using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Onion.CleanArchitecture.Application.Features.Departments.Commands.CreateDepartment;
using Onion.CleanArchitecture.Application.Features.Departments.Commands.DeleteDepartmentById;
using Onion.CleanArchitecture.Application.Features.Departments.Commands.UpdateDepartment;
using Onion.CleanArchitecture.Application.Features.Departments.Queries.GetAllDepartments;
using Onion.CleanArchitecture.Application.Features.Departments.Queries.GetDepartmentById;

namespace Onion.CleanArchitecture.WebApp.Server.Controllers.v1
{
    [Authorize]
    [Route("api/departments")]
    public class DepartmentController : BaseApiController
    {
        [Obsolete]
        public DepartmentController(
            Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment) : base(hostingEnvironment)
        {
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] GetAllDepartmentsParameter filter)
        {
            return await EnforcePermissionAndExecute("departments", "list", async () =>
            {
                return Ok(await Mediator.Send(new GetAllDepartmentsQuery()
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
            return await EnforcePermissionAndExecute("departments", "show", async () =>
            {
                return Ok(await Mediator.Send(new GetDepartmentByIdQuery { Id = id }));
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post(CreateDepartmentCommand command)
        {
            return await EnforcePermissionAndExecute("departments", "create", async () =>
            {
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, UpdateDepartmentCommand command)
        {
            return await EnforcePermissionAndExecute("departments", "edit", async () =>
            {
                if (id != command.Id) return BadRequest();
                return Ok(await Mediator.Send(command));
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await EnforcePermissionAndExecute("departments", "delete", async () =>
            {
                return Ok(await Mediator.Send(new DeleteDepartmentByIdCommand { Id = id }));
            });
        }
    }
}
