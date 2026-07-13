using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Commands.CreatePurchaseRequestCategory
{
    public class CreatePurchaseRequestCategoryCommand : IRequest<Response<int>>
    {
        public Guid PurchaseRequestId { get; set; }
        public Guid CategoryId { get; set; }
        public decimal AllowedQuota { get; set; }
        public decimal TotalProposedAmount { get; set; }
        public decimal Difference { get; set; }
        public decimal ActualTotalAmount { get; set; }
        public decimal ActualDifference { get; set; }
    }
    public class CreatePurchaseRequestCategoryCommandHandler : IRequestHandler<CreatePurchaseRequestCategoryCommand, Response<int>>
    {
        private readonly IPurchaseRequestCategoryRepositoryAsync _repository;
        private readonly IMapper _mapper;
        public CreatePurchaseRequestCategoryCommandHandler(IPurchaseRequestCategoryRepositoryAsync repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Response<int>> Handle(CreatePurchaseRequestCategoryCommand request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<PurchaseRequestCategory>(request);
            await _repository.AddAsync(entity);
            return new Response<int>(entity.Id);
        }
    }
}
