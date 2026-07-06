using Onion.CleanArchitecture.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Onion.CleanArchitecture.Domain.Entities
{
    public class Product : AuditableBaseEntity
    {
        public string Name { get; set; }
        public string Barcode { get; set; }
        public string Description { get; set; }
        public decimal Rate { get; set; }
        public decimal Price { get; set; }
    }
}
