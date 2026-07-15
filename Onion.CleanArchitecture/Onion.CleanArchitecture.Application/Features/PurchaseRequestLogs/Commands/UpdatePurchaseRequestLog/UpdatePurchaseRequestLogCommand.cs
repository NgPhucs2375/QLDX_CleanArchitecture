using AutoMapper;
using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using Onion.CleanArchitecture.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Commands.UpdatePurchaseRequestLog
{
    public class UpdatePurchaseRequestLogCommand : IRequest<Response<int>>
    {
        public int Id { get; set; }
        public int PurchaseRequestId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Action { get; set; }
        public string Note { get; set; }
    }
    public class UpdatePurchaseRequestLogCommandHandler : IRequestHandler<UpdatePurchaseRequestLogCommand, Response<int>>
    {
        private readonly IPurchaseRequestLogRepositoryAsync _repository;
        private readonly IMapper _mapper;
        public UpdatePurchaseRequestLogCommandHandler(IPurchaseRequestLogRepositoryAsync repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<Response<int>> Handle(UpdatePurchaseRequestLogCommand command, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(command.Id);
            if (entity == null) throw new ApiException($"PurchaseRequestLog Not Found.");
            entity = _mapper.Map(command, entity);
            await _repository.UpdateAsync(entity);
            return new Response<int>(entity.Id);
        }
    }
}
