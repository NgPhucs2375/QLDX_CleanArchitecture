using System.Collections.Generic;
using MassTransit;
using MassTransit.EntityFrameworkCoreIntegration;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onion.CleanArchitecture.Infrastructure.Messaging.Sagas;

namespace Onion.CleanArchitecture.Infrastructure.Persistence.Contexts
{
    public class SagaDbContext : MassTransit.EntityFrameworkCoreIntegration.SagaDbContext
    {
        public SagaDbContext(DbContextOptions<SagaDbContext> options) : base(options) { }

        protected override IEnumerable<ISagaClassMap> Configurations
        {
            get { yield return new PurchaseRequestSagaMap(); }
        }
    }

    public class PurchaseRequestSagaMap : SagaClassMap<PurchaseRequestSaga>
    {
        protected override void Configure(EntityTypeBuilder<PurchaseRequestSaga> entity, ModelBuilder model)
        {
            entity.Property(x => x.RequestId).IsRequired();
            entity.Property(x => x.CurrentState).HasMaxLength(64);
            entity.Property(x => x.CreatedBy).HasMaxLength(128);
            entity.Property(x => x.TotalAmount).HasColumnType("decimal(18,6)");
            entity.Property(x => x.CreatedAt);
            entity.Property(x => x.CompletedAt);
        }
    }
}
