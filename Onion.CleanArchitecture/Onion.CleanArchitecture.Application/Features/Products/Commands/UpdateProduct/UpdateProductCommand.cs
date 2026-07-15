using MediatR;
using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Interfaces.Repositories;
using Onion.CleanArchitecture.Application.Wrappers;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

/// <summary>
///  Nằm trong thiết kế CQRS (Command Query Reposibility Sêgregation)
/// 
/// UpdateProductCommand : là 1 Command (lệnh) dùng để cập nhật thông tin sản phẩm
/// Goal : update thông tin của 1 sản phẩm . nhận request từ FE, find sp trong Database, update dữ liệu và save
/// Ideas: 
///     1. Dùng MediatR để giảm phục thuộc: Lớp updateProductCommand đóng vai trò là "Bưu kiện" chứa dữ liệu user gửi lên
/// Lớp UpdateProductCommandHandler đóng vai trò là "Người xử lý bưu kiện" nhờ MediatR, Controller ở tầng API chỉ cần gửi bưu kiện đi ko quan tâm ai xử lý
///     
///     2. DI : IProductRepositoryAsync được ịnect vào qua Contructor.giúp code ko gọi trực tiếp Database, dễ dàng viết Unit test
///     3. Xử lý ngoại lệ chuẩn : Nếu không tìm thấy sản phẩm (product == null), nó ném ra ApiException thay vì để HT crash
///     4. Bọc kết quả trả về : Sử dụng Respone<int> để chuẩn hóa cấu trúc dữ liệu return FE (aalways have status code,thông báo lỗi, và data thực tế 
/// </summary>

namespace Onion.CleanArchitecture.Application.Features.Products.Commands.UpdateProduct
{
    public class UpdateProductCommand : IRequest<Response<int>>
    {
        public int Id { get; set; } // Khóa chính
        public string Code { get; set; } // Mã sản phẩm
        public string Name { get; set; } // Tên sản phẩm
        public int CategoryId { get; set; }
        public decimal UnitPrice { get; set; } // Giá sản phẩm
        public string Unit { get; set; } // Đơn vị tính
        public bool IsActive { get; set; } // Trạng thái hoạt động của sản phẩm
        public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Response<int>>
        {
            private readonly IProductRepositoryAsync _productRepository;
            public UpdateProductCommandHandler(IProductRepositoryAsync productRepository)
            {
                _productRepository = productRepository;
            }
            public async Task<Response<int>> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
            {
                var product = await _productRepository.GetByIdAsync(command.Id);

                if (product == null)
                {
                    throw new ApiException($"Product Not Found.");
                }
                else
                {
                    product.Code = command.Code;
                    product.Name = command.Name;
                    product.CategoryId = command.CategoryId;
                    product.UnitPrice = command.UnitPrice;
                    product.Unit = command.Unit;
                    product.IsActive = command.IsActive; // Ánh xạ vào trường Status của Entity
                   // Lưu vào database (các field audit )
                    await _productRepository.UpdateAsync(product);
                    return new Response<int>(product.Id);
                }
            }
        }
    }
}
