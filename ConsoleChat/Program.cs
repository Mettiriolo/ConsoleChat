using System.ClientModel;
using System.Text;
using ConsoleChat;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Yaml;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Microsoft.SemanticKernel.Memory;
using OpenAI;

// 配置 OpenAI 客户端
var builder = Kernel.CreateBuilder();

var config = new ConfigurationBuilder()
    .AddYamlFile("appsettings.yaml", optional: true, reloadOnChange: true)
    .AddUserSecrets<Program>()
    .Build();
string apiKey = config["ApiKey"]!;
string apiUri = config["DeepSeek:Endpoint"]!;
string modelId = config["DeepSeek:ModelIds:0"]!;

OpenAIClientOptions options = new()
{
    Endpoint = new Uri(apiUri)
};

// 创建 OpenAI 凭证
ApiKeyCredential credential = new(apiKey);

// 创建 OpenAI 客户端
OpenAIClient client = new(credential, options);

// 注册 OpenAI 聊天补全服务
builder.Services.AddOpenAIChatCompletion(
    modelId:modelId,
    openAIClient: client
);

var kernel = builder.Build();

// 注册原生 Skill
kernel.ImportPluginFromObject(new MySkills(), "MySkills");

kernel.ImportPluginFromObject(new MySkills(), "MySkill");
ChatHistory chatHistory = new();
var commonGreetings = new HashSet<string> { "hello", "hi" };

while (true)
{
    Console.Write("> ");
    string? userInput = Console.ReadLine();
    if (string.IsNullOrEmpty(userInput) || userInput.ToLower() == "exit") break;
    

    // 处理常见问题
    if (commonGreetings.Contains(userInput.ToLower()))
    {
        // 调用 Skill
        var result = await kernel.InvokeAsync<string>("MySkill", "Welcome");
        Console.WriteLine($"Bot: {result}");
    }
    // 通用问答，带上下文
    else
    {
        chatHistory.Add(new ChatMessageContent(AuthorRole.User, userInput));
        var service = kernel.GetRequiredService<IChatCompletionService>();
        
        var stream = service.GetStreamingChatMessageContentsAsync(chatHistory);
        Console.Write($"Bot:");
        StringBuilder sb = new();
        await foreach (var chunk in stream)
        {
            Console.Write(chunk);
            sb.Append(chunk);
        }
        Console.WriteLine();
        chatHistory.Add(new ChatMessageContent(AuthorRole.Assistant, sb.ToString()));
    }

}

Console.ReadKey();