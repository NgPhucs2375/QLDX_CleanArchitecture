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
        public Guid ProposalConfigId { get; set; }
        public Guid CategoryId { get; set; }
        public Guid DepartmentId { get; set; }
        public decimal AllowedQuota { get; set; }
        public decimal UsedAmount { get; set; }
        public decimal RemainingAmount { get; set; }
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
