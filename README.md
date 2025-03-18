### Semantic Kernel 是什么？核心功能概述
Semantic Kernel（简称 SK）是微软推出的一款开源框架，旨在让开发者轻松将 AI 大模型集成到应用中。它的设计理念是将复杂的 AI 能力抽象成简单易用的组件，让我们可以像调用普通 C# 方法一样调用 AI 功能。

SK 的核心功能包括：

1. **AI 服务集成**：支持连接 Azure OpenAI、Hugging Face 等模型。
2. **技能（Skills）**：封装可复用的功能，支持代码和自然语言提示。
3. **上下文记忆（Memory）**：让应用记住之前的交互，提供更智能的响应。

简单来说，SK 就像一个“智能助手调度中心”，帮助我们管理和调用 AI 能力，同时保持 .NET 开发的熟悉感。

### 核心组件解析：Kernel、Skills、Memory
在动手之前，我们先搞清楚 SK 的三大核心组件：

+ **Kernel**：SK 的“大脑”，负责协调 AI 请求、技能调用和内存管理。你可以把它想象成 ASP.NET Core 的服务容器，所有的功能都通过它来调度。
+ **Skills**：类似于插件或模块，可以是 C# 代码（原生 Skills）或基于提示的自然语言逻辑（语义 Skills）。比如，你可以写一个 Skill 来总结文本或翻译语言。
+ **Memory**：提供上下文记忆能力，让 AI 能“记住”之前的对话或数据。比如，问它“昨天说了什么”，它不会一脸懵逼。

这三者协同工作，让我们的应用既智能又灵活。

### 在 .NET 项目中安装 Semantic Kernel
动手之前，确保你有以下环境：

+ .NET 8 SDK（推荐最新版本）。
+ Visual Studio 或其他支持 C# 的 IDE。
+ 一个支持的 AI 服务（比如 Azure OpenAI 或 DeepSeek）的 API Key（今天我们用内置模拟器测试，下一篇文章再接入真实模型）。

#### 步骤 1：创建项目
打开终端，创建一个新的控制台应用：

```bash
dotnet new console -n SemanticKernelDemo
cd SemanticKernelDemo
```

#### 步骤 2：安装 NuGet 包
Semantic Kernel 的核心库可以通过 NuGet 安装。运行以下命令：

```bash
dotnet add package Microsoft.SemanticKernel
```

如果想用 Azure OpenAI，可以额外安装：

```bash
dotnet add package Microsoft.SemanticKernel.Connectors.AI.OpenAI
```

今天我们先用内置功能，所以只装核心包即可。

#### 步骤 3：验证安装
在 `Program.cs` 中添加以下代码，确保项目能编译：

```csharp
using Microsoft.SemanticKernel;

Console.WriteLine("Hello, Semantic Kernel!");
```

运行 `dotnet run`，如果看到输出，说明环境没问题。

### 第一个示例：搭建一个简单的 Semantic Kernel 应用
现在，我们写一个简单的例子：让 SK 返回一句问候语。完整代码如下：

```csharp
using Microsoft.SemanticKernel;

var builder = Kernel.CreateBuilder();
var kernel = builder.Build();

// 定义一个简单的语义函数（inline function）
var prompt = "Say hello to a .NET developer!";
var helloFunction = kernel.CreateFunctionFromPrompt(prompt);

// 调用并输出结果
string result = await kernel.InvokeAsync(helloFunction);
Console.WriteLine(result);
```

#### 代码解析
1. **创建 Kernel**：`Kernel.CreateBuilder()` 初始化一个 Kernel 实例。
2. **定义函数**：`CreateFunctionFromPrompt` 创建一个基于提示的语义函数。
3. **调用 AI**：`InvokeAsync` 执行函数并返回结果。


#### 配置 API Key 和连接外部模型
要让 Semantic Kernel 调用 DeepSeek API，需要以下准备：

+ **DeepSeek API 资源**：在 [DeepSeek 门户网站](https://www.deepseek.com/)获取 **API Key** 和 **Endpoint**。

#### 步骤 1：安装必要的 NuGet 包
确保项目已安装以下包（`<font style="color:rgb(28, 30, 33);">DeepSeek API 使用与 OpenAI 兼容的 API 格式，可以使用 OpenAI SDK 来访问 DeepSeek API</font>`）：

```bash
dotnet add package Microsoft.SemanticKernel.Connectors.AI.OpenAI
```

#### 步骤 2：配置 Kernel
在代码中，将DeepSeek API的配置注入 Kernel。修改 `Program.cs` 如下：

```csharp
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.AI.OpenAI;

var builder = Kernel.CreateBuilder();

// 配置 OpenAI 客户端
OpenAIClientOptions options = new()
{
   Endpoint = new Uri(API_URI)
};

// 创建 OpenAI 凭证
ApiKeyCredential credential = new(apiKey);

// 创建 OpenAI 客户端
OpenAIClient client = new(credential, options);

// 注册 OpenAI 聊天补全服务
builder.Services.AddOpenAIChatCompletion(
   modelId:MODEL_ID,
   openAIClient: client
);

var kernel = builder.Build();
```

**注意**：出于安全考虑，不要硬编码 API Key。推荐使用 `IConfiguration` 从 `appsettings.json` 或环境变量读取：

```csharp
var config = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
var apiKey = config["DeepSeek:ApiKey"];
//var apiKey = Environment.GetEnvironmentVariable("ApiKey");//从环境变量读取
```

使用IConfiguration时确保引入以下包：

```csharp
dotnet add package Microsoft.Extensions.Configuration
dotnet add package Microsoft.Extensions.Configuration.Json
```

### 示例代码：调用大模型生成文本
配置好后，我们来实现一个简单功能：输入一个问题，让模型回答。完整代码如下：

```csharp
// 定义一个简单的语义函数
var prompt = "你能做些什么?";
var askFunction = kernel.CreateFunctionFromPrompt(prompt);

// 调用并输出结果
string result = await kernel.InvokeAsync(askFunction);
Console.WriteLine($"Answer: {result}");
```

#### 运行结果
运行 `dotnet run`，你应该会看到：

```plain
Answer: 您好！我是由中国的深度求索（DeepSeek）公司开发的智能助手DeepSeek-V3。有关模型和产品的详细内容请参考官方文档。
```

### 常见问题与调试技巧
初次集成时，你可能会遇到一些坑。以下是常见问题及解决方法：

1. **“401 Unauthorized”**：检查 API Key 是否正确，端点是否拼写错误。
2. **“Model not found”**：确认 Azure 中已部署指定模型，且 `deploymentName` 与部署名称一致。
3. **超时或延迟**：网络问题或模型负载高，尝试增加超时设置：

```csharp
builder.Services.ConfigureHttpClient(client => client.Timeout = TimeSpan.FromSeconds(30));
```

调试时，可以启用日志：

```csharp
builder.Services.AddLogging(logging => logging.AddConsole().SetMinimumLevel(LogLevel.Debug));
```



