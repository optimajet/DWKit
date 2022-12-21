FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build

COPY src src
RUN dotnet publish src/OptimaJet.DWKit.StarterApplication/OptimaJet.DWKit.StarterApplication.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "OptimaJet.DWKit.StarterApplication.dll"]
