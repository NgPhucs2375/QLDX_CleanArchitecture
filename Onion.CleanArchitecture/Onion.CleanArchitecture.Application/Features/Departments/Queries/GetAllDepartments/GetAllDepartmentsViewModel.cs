using System;

namespace Onion.CleanArchitecture.Application.Features.Departments.Queries.GetAllDepartments
{
    public class GetAllDepartmentsViewModel
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string ManagerId { get; set; }
        public bool IsActive { get; set; }
    }
}
