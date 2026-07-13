using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.Departments.Queries.GetAllDepartments
{
    public class GetAllDepartmentsQuery : IRequest<Response<object>>
    {
        public int _start { get; set; }
        public int _end { get; set; }
        public string _sort { get; set; }
        public string _order { get; set; }
        public List<string> _filter { get; set; }
    }
    public class GetAllDepartmentsQueryHandler : IRequestHandler<GetAllDepartmentsQuery, Response<object>>
    {
        private readonly IDepartmentRepositoryAsync _departmentRepository;
        private readonly IMapper _mapper;
        public GetAllDepartmentsQueryHandler(IDepartmentRepositoryAsync departmentRepository, IMapper mapper)
        {
            _departmentRepository = departmentRepository;
            _mapper = mapper;
        }

        public async Task<Response<object>> Handle(GetAllDepartmentsQuery request, CancellationToken cancellationToken)
        {
            var validFilter = _mapper.Map<GetAllDepartmentsParameter>(request);
            var departments = await _departmentRepository.GetPagedDepartmentsAsync(validFilter);
            return new Response<object>(true, new
            {
                departments._start,
                departments._end,
                departments._total,
                departments._hasNext,
                departments._hasPrevious,
                departments._pages,
                _data = departments
            }, message: "Success");
        }
    }
}
