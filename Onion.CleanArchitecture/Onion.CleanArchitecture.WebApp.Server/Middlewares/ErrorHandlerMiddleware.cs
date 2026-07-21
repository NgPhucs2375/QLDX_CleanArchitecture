using Onion.CleanArchitecture.Application.Exceptions;
using Onion.CleanArchitecture.Application.Wrappers;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging; 

namespace Onion.CleanArchitecture.WebApp.Server.Middlewares
{
    public class ErrorHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlerMiddleware> _logger; // 1. Khai báo Logger

        public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger; // 2. Inject Logger
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception error)
            {
                // 3. IN ĐỎ LỖI RA CONSOLE ĐỂ BACKEND DEV NHÌN THẤY NGAY LẬP TỨC
                _logger.LogError(error, "⚠️ [API ERROR] Path: {Path} | Message: {Message}", context.Request.Path, error.Message);

                var response = context.Response;
                response.ContentType = "application/json";
                var responseModel = new Response<string>() { Succeeded = false, Message = error?.Message };

                switch (error)
                {
                    case Application.Exceptions.ApiException e:
                        response.StatusCode = (int)HttpStatusCode.BadRequest;
                        break;
                    case ValidationException e:
                        response.StatusCode = (int)HttpStatusCode.BadRequest;
                        responseModel.Errors = e.Errors;
                        break;
                    case KeyNotFoundException e:
                        response.StatusCode = (int)HttpStatusCode.NotFound;
                        break;
                    case DbUpdateException dbEx:
                        response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        responseModel.Message = dbEx.InnerException?.Message ?? dbEx.Message;
                        break;
                    default:
                        response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        break;
                }
                
                // Must match controller serialization (PascalCase) so frontend ResponseRoot can read it
                var result = JsonSerializer.Serialize(responseModel);
                
                await response.WriteAsync(result);
            }
        }
    }
}