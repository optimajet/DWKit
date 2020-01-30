FROM microsoft/dotnet:2.1-runtime AS base
WORKDIR /app

FROM microsoft/dotnet:2.1-sdk AS build

WORKDIR /src
COPY src/OptimaJet.DWKit.StarterApplication/OptimaJet.DWKit.StarterApplication.csproj src/OptimaJet.DWKit.StarterApplication/
COPY src/OptimaJet.DWKit.Application/OptimaJet.DWKit.Application.csproj src/OptimaJet.DWKit.Application/
RUN dotnet restore src/OptimaJet.DWKit.StarterApplication/OptimaJet.DWKit.StarterApplication.csproj  --source https://api.nuget.org/v3/index.json
COPY . .
WORKDIR /src/src/OptimaJet.DWKit.StarterApplication
RUN dotnet build OptimaJet.DWKit.StarterApplication.csproj -c Release -o /app

FROM build AS publish
RUN dotnet publish OptimaJet.DWKit.StarterApplication.csproj -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "OptimaJet.DWKit.StarterApplication.dll"]
