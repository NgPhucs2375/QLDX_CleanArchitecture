using AutoMapper;
using Onion.CleanArchitecture.Application.Features.Categories.Commands.CreateCategory;
using Onion.CleanArchitecture.Application.Features.Categories.Queries.GetAllCategories;
using Onion.CleanArchitecture.Application.Features.ConfigApprovers.Commands.CreateConfigApprover;
using Onion.CleanArchitecture.Application.Features.ConfigApprovers.Queries.GetAllConfigApprovers;
using Onion.CleanArchitecture.Application.Features.ConfigCategories.Commands.CreateConfigCategory;
using Onion.CleanArchitecture.Application.Features.ConfigCategories.Queries.GetAllConfigCategories;
using Onion.CleanArchitecture.Application.Features.Departments.Commands.CreateDepartment;
using Onion.CleanArchitecture.Application.Features.Departments.Queries.GetAllDepartments;
using Onion.CleanArchitecture.Application.Features.Products.Commands.CreateProduct;
using Onion.CleanArchitecture.Application.Features.Products.Queries.GetAllProducts;
using Onion.CleanArchitecture.Application.Features.ProposalConfigs.Commands.CreateProposalConfig;
using Onion.CleanArchitecture.Application.Features.ProposalConfigs.Queries.GetAllProposalConfigs;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Commands.CreatePurchaseRequestCategory;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestCategories.Queries.GetAllPurchaseRequestCategories;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Commands.CreatePurchaseRequestItem;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestItems.Queries.GetAllPurchaseRequestItems;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Commands.CreatePurchaseRequestLog;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Commands.UpdatePurchaseRequestLog;
using Onion.CleanArchitecture.Application.Features.PurchaseRequestLogs.Queries.GetAllPurchaseRequestLogs;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Commands.CreatePurchaseRequest;
using Onion.CleanArchitecture.Application.Features.PurchaseRequests.Queries.GetAllPurchaseRequests;
using Onion.CleanArchitecture.Domain.Entities;

namespace Onion.CleanArchitecture.Application.Mappings
{
    public class GeneralProfile : Profile
    {
        public GeneralProfile()
        {
            CreateMap<Product, GetAllProductsViewModel>().ReverseMap();
            CreateMap<CreateProductCommand, Product>();
            CreateMap<GetAllProductsQuery, GetAllProductsParameter>();

            CreateMap<Category, GetAllCategoriesViewModel>().ReverseMap();
            CreateMap<CreateCategoryCommand, Category>();
            CreateMap<GetAllCategoriesQuery, GetAllCategoriesParameter>();

            CreateMap<Department, GetAllDepartmentsViewModel>().ReverseMap();
            CreateMap<CreateDepartmentCommand, Department>();
            CreateMap<GetAllDepartmentsQuery, GetAllDepartmentsParameter>();

            CreateMap<ProposalConfig, GetAllProposalConfigsViewModel>().ReverseMap();
            CreateMap<CreateProposalConfigCommand, ProposalConfig>();
            CreateMap<GetAllProposalConfigsQuery, GetAllProposalConfigsParameter>();

            CreateMap<ConfigCategory, GetAllConfigCategoriesViewModel>().ReverseMap();
            CreateMap<CreateConfigCategoryCommand, ConfigCategory>();
            CreateMap<GetAllConfigCategoriesQuery, GetAllConfigCategoriesParameter>();

            CreateMap<ConfigApprover, GetAllConfigApproversViewModel>().ReverseMap();
            CreateMap<CreateConfigApproverCommand, ConfigApprover>();
            CreateMap<GetAllConfigApproversQuery, GetAllConfigApproversParameter>();

            CreateMap<PurchaseRequest, GetAllPurchaseRequestsViewModel>().ReverseMap();
            CreateMap<GetAllPurchaseRequestsQuery, GetAllPurchaseRequestsParameter>();

            CreateMap<PurchaseRequestCategory, GetAllPurchaseRequestCategoriesViewModel>().ReverseMap();
            CreateMap<CreatePurchaseRequestCategoryCommand, PurchaseRequestCategory>();
            CreateMap<GetAllPurchaseRequestCategoriesQuery, GetAllPurchaseRequestCategoriesParameter>();

            CreateMap<PurchaseRequestItem, GetAllPurchaseRequestItemsViewModel>().ReverseMap();
            CreateMap<CreatePurchaseRequestItemCommand, PurchaseRequestItem>();
            CreateMap<GetAllPurchaseRequestItemsQuery, GetAllPurchaseRequestItemsParameter>();

            CreateMap<PurchaseRequestLog, GetAllPurchaseRequestLogsViewModel>().ReverseMap();
            CreateMap<CreatePurchaseRequestLogCommand, PurchaseRequestLog>();
            CreateMap<UpdatePurchaseRequestLogCommand, PurchaseRequestLog>();
            CreateMap<GetAllPurchaseRequestLogsQuery, GetAllPurchaseRequestLogsParameter>();
        }
    }
}
