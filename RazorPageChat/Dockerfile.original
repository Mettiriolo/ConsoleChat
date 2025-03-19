# 1. 使用官方 ASP.NET Core 运行时镜像
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app

# 2. 创建 Data Protection 目录（避免权限问题）
RUN mkdir -p /app/dataprotection && chmod -R 777 /app/dataprotection

# 3. 持久化 Data Protection 密钥
VOLUME /app/dataprotection

# 4. 复制发布后的应用程序
COPY ./publish .

# 5. 暴露端口
EXPOSE 80
EXPOSE 443

# 6. 运行应用
ENTRYPOINT ["dotnet", "RazorPageChat.dll"]
