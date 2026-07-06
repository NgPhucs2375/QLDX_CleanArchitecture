using System;

namespace Onion.CleanArchitecture.Application.Interfaces
{
    public interface IDateTimeService
    {
        DateTime NowUtc { get; }
        DateTime Now { get; }
    }
}
