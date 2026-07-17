using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ConfigCategories.Commands.UpdateConfigCategory
{
    public class UpdateConfigCategoryCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public int ProposalConfigId { get; set; }
        public int CategoryId { get; set; }
        public int DepartmentId { get; set; }
        public decimal AllowedQuota { get; set; }


        public class UpdateConfigCategoryCommandHandler : IRequestHandler<UpdateConfigCategoryCommand, Response<int>>
        {
            private readonly IConfigCategoryRepositoryAsync _configCategoryRepository;
            public UpdateConfigCategoryCommandHandler(IConfigCategoryRepositoryAsync configCategoryRepository)
            {
                _configCategoryRepository = configCategoryRepository;
            }
            public async Task<Response<int>> Handle(UpdateConfigCategoryCommand command, CancellationToken cancellationToken)
            {
                var configCategory = await _configCategoryRepository.GetByIdAsync(command.Id);
                if (configCategory == null)
                {
                    throw new ApiException($"ConfigCategory Not Found.");
                }
                else
                {
                    configCategory.ProposalConfigId = command.ProposalConfigId;
                    configCategory.CategoryId = command.CategoryId;
                    configCategory.DepartmentId = command.DepartmentId;
                    configCategory.AllowedQuota = command.AllowedQuota;
                    await _configCategoryRepository.UpdateAsync(configCategory);
                    return new Response<int>(configCategory.Id);
                }
            }
        }
    }
}
