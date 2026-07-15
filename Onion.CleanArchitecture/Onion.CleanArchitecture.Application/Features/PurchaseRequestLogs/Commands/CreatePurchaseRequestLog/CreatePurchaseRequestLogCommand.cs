using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Commands.CreatePurchaseRequestLog
{
    public class CreatePurchaseRequestLogCommand : IRequest<Response<int>>
    {
        public int PurchaseRequestId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Action { get; set; }
        public string Note { get; set; }
    }
    public class CreatePurchaseRequestLogCommandHandler : IRequestHandler<CreatePurchaseRequestLogCommand, Response<int>>
    {
        private readonly IPurchaseRequestLogRepositoryAsync _repository;
        private readonly IMapper _mapper;
        public CreatePurchaseRequestLogCommandHandler(IPurchaseRequestLogRepositoryAsync repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Response<int>> Handle(CreatePurchaseRequestLogCommand request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<PurchaseRequestLog>(request);
            await _repository.AddAsync(entity);
            return new Response<int>(entity.Id);
        }
    }
}
