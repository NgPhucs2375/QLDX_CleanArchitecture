using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Onion.CleanArchitecture.Application.Features.ProposalConfigs.Queries.GetProposalConfigById
{
    // 1. KHAI BÁO TRỰC TIẾP CÁC DTO TẠI ĐÂY
    public class ProposalConfigDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public DateTime? EffectiveDate { get; set; }
        public int Status { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? Created { get; set; }
        public string LastModifiedBy { get; set; }
        public DateTime? LastModified { get; set; }
        public List<ConfigCategoryDto> ConfigCategories { get; set; }
        public List<ConfigApproverDto> ConfigApprovers { get; set; }
    }

    public class ConfigCategoryDto
    {
        public int Id { get; set; }
    }

    public class ConfigApproverDto
    {
        public int Id { get; set; }
    }

    // 2. QUERY VÀ HANDLER CHÍNH
    public class GetProposalConfigByIdQuery : IRequest<Response<ProposalConfigDto>>
    {
        public int Id { get; set; }
        
        public class GetProposalConfigByIdQueryHandler : IRequestHandler<GetProposalConfigByIdQuery, Response<ProposalConfigDto>>
        {
            private readonly IProposalConfigRepositoryAsync _proposalConfigRepository;
            
            public GetProposalConfigByIdQueryHandler(IProposalConfigRepositoryAsync proposalConfigRepository)
            {
                _proposalConfigRepository = proposalConfigRepository;
            }
            
            public async Task<Response<ProposalConfigDto>> Handle(GetProposalConfigByIdQuery query, CancellationToken cancellationToken)
            {
                // Lấy dữ liệu từ DB (đã có Include ở Repository)
                var record = await _proposalConfigRepository.GetByIdWithDetailsAsync(query.Id);
                
                if (record == null) throw new ApiException($"ProposalConfig Not Found.");

                // Gán biến (Mapping) thủ công
                var dto = new ProposalConfigDto
                {
                    Id = record.Id,
                    Code = record.Code,
                    Name = record.Name,
                    EffectiveDate = record.EffectiveDate,
                    Status = (int)record.Status,
                    CreatedBy = record.CreatedBy,
                    Created = record.Created,
                    LastModifiedBy = record.LastModifiedBy,
                    LastModified = record.LastModified,
                    
                    // Xử lý 2 mảng, dùng ?? để tránh lỗi null nếu mảng trống
                    ConfigCategories = record.ConfigCategories?.Select(c => new ConfigCategoryDto 
                    {
                        Id = c.Id
                    }).ToList() ?? new List<ConfigCategoryDto>(),
                    
                    ConfigApprovers = record.ConfigApprovers?.Select(a => new ConfigApproverDto 
                    {
                        Id = a.Id
                    }).ToList() ?? new List<ConfigApproverDto>()
                };

                return new Response<ProposalConfigDto>(dto);
            }
        }
    }
}