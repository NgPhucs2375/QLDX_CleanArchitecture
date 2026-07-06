using Onion.CleanArchitecture.Application.Interfaces;
using System;

namespace Onion.CleanArchitecture.Infrastructure.Shared.Services
{
    public class DateTimeService : IDateTimeService
    {
        public DateTime NowUtc => DateTime.UtcNow;

        public DateTime Now => DateTime.Now;
    }
}
