using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.CreatePurchaseRequestItem
{
    public class CreatePurchaseRequestItemCommand : IRequest<Response<int>>
    {
        public int PurchaseRequestCategoryId { get; set; }
        public int ProductId { get; set; }
        public decimal UnitPrice { get; set; }
        public int ProposedQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public int ActualQuantity { get; set; }
        public decimal ActualTotalAmount { get; set; }
    }
    public class CreatePurchaseRequestItemCommandHandler : IRequestHandler<CreatePurchaseRequestItemCommand, Response<int>>
    {
        private readonly IPurchaseRequestItemRepositoryAsync _repository;
        private readonly IMapper _mapper;
        public CreatePurchaseRequestItemCommandHandler(IPurchaseRequestItemRepositoryAsync repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Response<int>> Handle(CreatePurchaseRequestItemCommand request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<PurchaseRequestItem>(request);
            await _repository.AddAsync(entity);
            return new Response<int>(entity.Id);
        }
    }
}
