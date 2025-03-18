using Microsoft.SemanticKernel;

namespace ConsoleChat;

public class MySkills
{
    [KernelFunction("Welcome")]
    public string Welcome()
    {
        return "Hello World!";
    }

    
    [KernelFunction("ToUpper")]
    public string ToUpperCase(string input)
    {
        return input.ToUpper();
    }
    
    [KernelFunction("Summarize")]
    public async Task<string?> SummarizeAsync(string input, Kernel kernel)
    {
        var prompt = "简要总结以下文本:\n{{$input}}";
        var summarizeFunction = kernel.CreateFunctionFromPrompt(prompt);
        return await kernel.InvokeAsync<string>(summarizeFunction, new KernelArguments { ["input"] = input });
    }
}