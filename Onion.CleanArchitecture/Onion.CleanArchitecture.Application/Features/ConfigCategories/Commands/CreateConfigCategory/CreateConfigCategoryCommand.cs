using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ConfigCategories.Commands.CreateConfigCategory
{
    public class CreateConfigCategoryCommand : IRequest<Response<int>>
    {
        public int ProposalConfigId { get; set; }
        public int CategoryId { get; set; }
        public int DepartmentId { get; set; }
        public decimal AllowedQuota { get; set; }
 
    }
    public class CreateConfigCategoryCommandHandler : IRequestHandler<CreateConfigCategoryCommand, Response<int>>
    {
        private readonly IConfigCategoryRepositoryAsync _configCategoryRepository;
        private readonly IMapper _mapper;
        public CreateConfigCategoryCommandHandler(IConfigCategoryRepositoryAsync configCategoryRepository, IMapper mapper)
        {
            _configCategoryRepository = configCategoryRepository;
            _mapper = mapper;
        }

        public async Task<Response<int>> Handle(CreateConfigCategoryCommand request, CancellationToken cancellationToken)
        {
            var configCategory = _mapper.Map<ConfigCategory>(request);
             await _configCategoryRepository.AddAsync(configCategory);
            return new Response<int>(configCategory.Id);
        }
    }
}
