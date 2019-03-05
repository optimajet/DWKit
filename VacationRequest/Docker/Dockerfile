FROM microsoft/dotnet:2.1-aspnetcore-runtime AS base
WORKDIR /app
EXPOSE 80

FROM microsoft/dotnet:2.1-sdk AS build
WORKDIR /src
COPY OptimaJet.DWKit.StarterApplication/OptimaJet.DWKit.StarterApplication.csproj OptimaJet.DWKit.StarterApplication/
COPY OptimaJet.DWKit.Application/OptimaJet.DWKit.Application.csproj OptimaJet.DWKit.Application/
RUN dotnet restore OptimaJet.DWKit.StarterApplication/OptimaJet.DWKit.StarterApplication.csproj
COPY . .
WORKDIR /src/OptimaJet.DWKit.StarterApplication
RUN dotnet build OptimaJet.DWKit.StarterApplication.csproj -c Release -o /app

FROM build AS publish
RUN dotnet publish OptimaJet.DWKit.StarterApplication.csproj -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "OptimaJet.DWKit.StarterApplication.dll"]
