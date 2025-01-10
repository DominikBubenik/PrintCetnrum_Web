/*
# Use the official .NET SDK to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS BUILD
WORKDIR /src


COPY *.csproj ./
RUN dotnet restore 
COPY . ./
RUN dotnet publish -c Release -o out

# Use the official .NET runtime to run the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app ./

# Expose port 5000
EXPOSE 5000

# Start the application
ENTRYPOINT ["dotnet", "pritncetnrum_web.dll"]*/
