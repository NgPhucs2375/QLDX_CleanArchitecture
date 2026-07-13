using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using Onion.CleanArchitecture.Domain.Enums;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.CreatePurchaseRequest
{
    public class CreatePurchaseRequestCommand : IRequest<Response<int>>
    {
        public string Code { get; set; }
        public Guid DepartmentId { get; set; }
        public Guid PurchaseConfigId { get; set; }
        public PurchaseRequestStatus Status { get; set; } = PurchaseRequestStatus.Draft;
        public decimal TotalProposedAmount { get; set; }
        public decimal TotalActualAmount { get; set; }
    }
    public class CreatePurchaseRequestCommandHandler : IRequestHandler<CreatePurchaseRequestCommand, Response<int>>
    {
        private readonly IPurchaseRequestRepositoryAsync _purchaseRequestRepository;
        private readonly IMapper _mapper;
        public CreatePurchaseRequestCommandHandler(IPurchaseRequestRepositoryAsync purchaseRequestRepository, IMapper mapper)
        {
            _purchaseRequestRepository = purchaseRequestRepository;
            _mapper = mapper;
        }

        public async Task<Response<int>> Handle(CreatePurchaseRequestCommand request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<PurchaseRequest>(request);
            await _purchaseRequestRepository.AddAsync(entity);
            return new Response<int>(entity.Id);
        }
    }
}
