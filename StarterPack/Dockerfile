FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build

COPY src src
RUN dotnet publish src/OptimaJet.DWKit.StarterApplication/OptimaJet.DWKit.StarterApplication.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "OptimaJet.DWKit.StarterApplication.dll"]
