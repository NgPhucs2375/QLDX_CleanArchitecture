#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Onion.CleanArchitecture/Onion.CleanArchitecture.WebApp.Client/nuget.config", "Onion.CleanArchitecture/Onion.CleanArchitecture.WebApp.Client/"]
COPY ["Onion.CleanArchitecture/Onion.CleanArchitecture.WebApp.Server/Onion.CleanArchitecture.WebApp.Server.csproj", "Onion.CleanArchitecture/Onion.CleanArchitecture.WebApp.Server/"]
COPY ["Onion.CleanArchitecture/Onion.CleanArchitecture.Infrastructure.Identity/Onion.CleanArchitecture.Infrastructure.Identity.csproj", "Onion.CleanArchitecture/Onion.CleanArchitecture.Infrastructure.Identity/"]
COPY ["Onion.CleanArchitecture/Onion.CleanArchitecture.Infrastructure.Shared/Onion.CleanArchitecture.Infrastructure.Shared.csproj", "Onion.CleanArchitecture/Onion.CleanArchitecture.Infrastructure.Shared/"]
COPY ["Onion.CleanArchitecture/Onion.CleanArchitecture.Application/Onion.CleanArchitecture.Application.csproj", "Onion.CleanArchitecture/Onion.CleanArchitecture.Application/"]
COPY ["Onion.CleanArchitecture/Onion.CleanArchitecture.Domain/Onion.CleanArchitecture.Domain.csproj", "Onion.CleanArchitecture/Onion.CleanArchitecture.Domain/"]
COPY ["Onion.CleanArchitecture/Onion.CleanArchitecture.Infrastructure.Persistence/Onion.CleanArchitecture.Infrastructure.Persistence.csproj", "Onion.CleanArchitecture/Onion.CleanArchitecture.Infrastructure.Persistence/"]
COPY ["Onion.CleanArchitecture/Onion.CleanArchitecture.WebApp.Client/Onion.CleanArchitecture.WebApp.Client.esproj", "Onion.CleanArchitecture/Onion.CleanArchitecture.WebApp.Client/"]
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt install -y nodejs
RUN dotnet restore "./Onion.CleanArchitecture/Onion.CleanArchitecture.WebApp.Server/Onion.CleanArchitecture.WebApp.Server.csproj"
COPY . .
WORKDIR "/src/Onion.CleanArchitecture/Onion.CleanArchitecture.WebApp.Server"
RUN dotnet build "./Onion.CleanArchitecture.WebApp.Server.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Onion.CleanArchitecture.WebApp.Server.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Onion.CleanArchitecture.WebApp.Server.dll"]