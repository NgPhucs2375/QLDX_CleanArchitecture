using System;
using Onion.CleanArchitecture.Application.Features.Products.Commands.CreateProduct;

namespace Onion.CleanArchitecture.Application
{
    public class CreateRangeProductResponse : CreateProductCommand
    {
        public string Message { get; set; }
        public bool Success { get; set; }
    }
}
