FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
WORKDIR /src
COPY ["Template.csproj", "./"]
RUN dotnet restore -a $TARGETARCH "Template.csproj"
COPY . .
WORKDIR "/src/"
RUN dotnet build "Template.csproj" -a $TARGETARCH -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Template.csproj" -a "$TARGETARCH" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
LABEL cyanprint.dev=true
ENV ASPNETCORE_URLS=http://+:5550
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Template.dll"]
